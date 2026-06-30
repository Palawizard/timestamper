use tauri_plugin_sql::{Migration, MigrationKind};

fn app_migrations() -> Vec<Migration> {
    let initial_migration = Migration {
        version: 1,
        description: "create initial timestamp tables",
        sql: "
            CREATE TABLE IF NOT EXISTS stream_sessions (
                id TEXT PRIMARY KEY,
                title TEXT,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                duration_ms INTEGER,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS timestamp_marks (
                id TEXT PRIMARY KEY,
                stream_session_id TEXT NOT NULL,
                offset_ms INTEGER NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (stream_session_id) REFERENCES stream_sessions(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS timestamp_marks_stream_session_id_idx
                ON timestamp_marks(stream_session_id);

            CREATE TABLE IF NOT EXISTS app_settings (
                id TEXT PRIMARY KEY,
                start_stop_hotkey TEXT NOT NULL,
                add_mark_hotkey TEXT NOT NULL,
                timestamp_format TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        ",
        kind: MigrationKind::Up,
    };

    vec![
        initial_migration,
        Migration {
            version: 2,
            description: "add obs integration settings",
            sql: "
                ALTER TABLE app_settings ADD COLUMN obs_enabled INTEGER NOT NULL DEFAULT 0;
                ALTER TABLE app_settings ADD COLUMN obs_host TEXT NOT NULL DEFAULT '127.0.0.1';
                ALTER TABLE app_settings ADD COLUMN obs_port INTEGER NOT NULL DEFAULT 4455;
                ALTER TABLE app_settings ADD COLUMN obs_password TEXT NOT NULL DEFAULT '';
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add stream session control source",
            sql: "
                ALTER TABLE stream_sessions ADD COLUMN control_source TEXT NOT NULL DEFAULT 'manual';
            ",
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = app_migrations();

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:timestamper.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::app_migrations;
    use sha2::{Digest, Sha384};

    #[test]
    fn keeps_obs_migrations_separate_from_the_initial_schema() {
        let migrations = app_migrations();

        assert_eq!(migrations.len(), 3);
        assert_eq!(migrations[0].version, 1);
        assert_eq!(
            format!("{:x}", Sha384::digest(migrations[0].sql.as_bytes())),
            "b85210baa271d94e4fac00aeb93e628f57687995c24c9bb5eaa911811957efd583d4dbf3267f2f461de936c92789f5bb"
        );
        assert!(!migrations[0].sql.contains("obs_enabled"));
        assert_eq!(migrations[1].version, 2);
        assert!(migrations[1].sql.contains("obs_enabled"));
        assert!(migrations[1].sql.contains("DEFAULT 4455"));
        assert_eq!(migrations[2].version, 3);
        assert!(migrations[2].sql.contains("control_source"));
        assert!(migrations[2].sql.contains("DEFAULT 'manual'"));
    }
}
