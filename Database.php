<?php
class Database {
    private $conn;

    public function __construct() {
        $this->conn = null;
    }

    public function getConnection() {
        if ($this->conn) return $this->conn;

        try {
            $databaseUrl = getenv('DATABASE_URL');

            if ($databaseUrl) {
                $dbparts = parse_url($databaseUrl);
                $host = $dbparts['host'];
                $port = $dbparts['port'] ?? 3306;
                $dbname = ltrim($dbparts['path'], '/');
                $username = $dbparts['user'];
                $password = $dbparts['pass'];
                $scheme = $dbparts['scheme'];

                if (strpos($scheme, 'mysql') !== false) {
                    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                } else {
                    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";
                }
                $this->conn = new PDO($dsn, $username, $password);
            } else {
                // FreeDB MySQL credentials from environment
                $host = getenv('DB_HOST') ?: '127.0.0.1';
                $port = getenv('DB_PORT') ?: '3306';
                $dbname = getenv('DB_NAME') ?: 'weatheralert_db';
                $username = getenv('DB_USER') ?: 'root';
                $password = getenv('DB_PASS') ?: '';

                $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                $this->conn = new PDO($dsn, $username, $password);
            }

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch(PDOException $e) {
            error_log("Connection error: " . $e->getMessage());
            throw $e;
        }

        return $this->conn;
    }

    public function fetchOne($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch(PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            return null;
        }
    }

    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            return [];
        }
    }

    public function insert($table, $data) {
        try {
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute(array_values($data));
            return $this->getConnection()->lastInsertId();
        } catch(PDOException $e) {
            error_log("Insert error: " . $e->getMessage());
            throw $e;
        }
    }

    public function execute($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log("Execute error: " . $e->getMessage());
            throw $e;
        }
    }
}
?>