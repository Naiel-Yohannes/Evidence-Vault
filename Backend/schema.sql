CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE findings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) DELETE ON CASCADE,
  title VARCHAR(50) NOT NULL,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) NOT NULL,
  description VARCHAR(255) NOT NULL,
  remediation VARCHAR(255) NOT NULL,
  status TEXT CHECK (status IN ('Open', 'Resolved')) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)