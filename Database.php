<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Check if DATABASE_URL exists (Render)
        $databaseUrl = getenv('DATABASE_URL');
        
        if ($databaseUrl) {
            // Parse Render's DATABASE_URL
            $dbparts = parse_url($databaseUrl);
            $this->host = $dbparts['host'];
            $this->port = $dbparts['port'];
            $this->db_name = ltrim($dbparts['path'], '/');
            $this->username = $dbparts['user'];
            $this->password = $dbparts['pass'];
        } else {
            // Local development
            $this->host = getenv('DB_HOST') ?: 'localhost';
            $this->db_name = getenv('DB_NAME') ?: 'weatheralert_db';
            $this->username = getenv('DB_USER') ?: 'root';
            $this->password = getenv('DB_PASS') ?: '';
            $this->port = 3306;
        }
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            // Use PostgreSQL for Render, MySQL for local
            if (getenv('DATABASE_URL')) {
                // PostgreSQL connection for Render
                $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name};sslmode=require";
                $this->conn = new PDO($dsn, $this->username, $this->password);
            } else {
                // MySQL connection for local
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
                $this->conn = new PDO($dsn, $this->username, $this->password);
            }
            
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("Connection error: " . $e->getMessage());
            throw $e;
        }
        
        return $this->conn;
    }
}
?>