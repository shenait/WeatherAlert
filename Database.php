<?php
class Database {
    private $conn;

    public function __construct() {
        $this->conn = null;
    }

    public function getConnection() {
        if ($this->conn) return $this->conn;

        try {
            $host     = 'weatheralert-db-weatheralert2026.b.aivencloud.com';
            $port     = '18209';
            $dbname   = 'defaultdb'; 
            $username = 'avnadmin';            
            $password = '';               

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $this->conn = new PDO($dsn, $username, $password, $options);

        } catch (\PDOException $e) {
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
        } catch (\PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            return null;
        }
    }

    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            return [];
        }
    }

    public function insert($table, $data) {
        try {
            $columns      = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql          = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
            $stmt         = $this->getConnection()->prepare($sql);
            $stmt->execute(array_values($data));
            return $this->getConnection()->lastInsertId();
        } catch (\PDOException $e) {
            error_log("Insert error: " . $e->getMessage());
            throw $e;
        }
    }

    public function execute($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (\PDOException $e) {
            error_log("Execute error: " . $e->getMessage());
            throw $e;
        }
    }
}
?>