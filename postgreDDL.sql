CREATE TABLE Kecamatan (
    kec_id SERIAL PRIMARY KEY,
    nama_kec VARCHAR(20) NOT NULL
);

CREATE TABLE Kelurahan (
    kel_id SERIAL PRIMARY KEY,
    nama_kel VARCHAR(50) NOT NULL,
    kec_id INT REFERENCES Kecamatan(kec_id) NOT NULL
);

CREATE TYPE pengguna_role AS ENUM ('admin', 'pengguna');

CREATE TABLE Pengguna (
    pengguna_id SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    no_hp VARCHAR(30),
    alamat VARCHAR(255), 
    email VARCHAR(255) UNIQUE,
    role pengguna_role NOT NULL DEFAULT 'pengguna',
    kel_id INT REFERENCES Kelurahan(kel_id) NOT NULL
);

CREATE TABLE Bs_Pusat (
    bs_pusat_id SERIAL PRIMARY KEY,
    no_telp CHAR(12) NOT NULL,
    alamat VARCHAR(50) NOT NULL,
    kel_id INT REFERENCES Kelurahan(kel_id) NOT NULL
);

CREATE TYPE tipe_transaksi_enum AS ENUM ('masuk', 'keluar');

CREATE TABLE Transaksi (
    transaksi_id SERIAL PRIMARY KEY,
    tanggal TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipe_transaksi tipe_transaksi_enum NOT NULL DEFAULT 'masuk',
    pengguna_id INT REFERENCES pengguna(pengguna_id) NOT NULL,
    bs_pusat_id INT REFERENCES Bs_pusat(bs_pusat_id) NOT NULL
);

CREATE TABLE Jenis_Sampah (
    jenis_sampah_id SERIAL PRIMARY KEY,
    nama_jenis_sampah VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE SUK (
    suk_id SERIAL PRIMARY KEY,
    nama_suk VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE Sampah (
    sampah_id SERIAL PRIMARY KEY,
    nama_sampah VARCHAR(40) NOT NULL UNIQUE,
    jenis_sampah_id INT REFERENCES Jenis_Sampah(jenis_sampah_id) NOT NULL,
    harga_sekarang INT NOT NULL,
    url_gambar VARCHAR(255),
    suk_id INT REFERENCES SUK(suk_id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE Transaksi_Sampah (
    transaksi_sampah_id INT REFERENCES Transaksi(transaksi_id),
    sampah_id INT REFERENCES Sampah(sampah_id) NOT NULL,
    harga_id INT REFERENCES Harga(harga_id) NOT NULL,
    jumlah_sampah INT NOT NULL,
    PRIMARY KEY (transaksi_sampah_id, sampah_id)
);

CREATE TABLE Harga (
    harga_id SERIAL PRIMARY KEY,
    sampah_id INT REFERENCES Sampah(sampah_id),
    tanggal_ubah TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    harga_sampah INT NOT NULL,
    UNIQUE (sampah_id, tanggal_ubah)
);

CREATE OR REPLACE FUNCTION set_latest_harga()
RETURNS TRIGGER AS $$
BEGIN
    NEW.harga_id := (
        SELECT harga_id
        FROM Harga
        WHERE sampah_id = NEW.sampah_id
        ORDER BY tanggal_ubah DESC
        LIMIT 1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_transaksi_sampah
BEFORE INSERT ON Transaksi_Sampah
FOR EACH ROW
EXECUTE FUNCTION set_latest_harga();

