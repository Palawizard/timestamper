use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
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
    }];

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
