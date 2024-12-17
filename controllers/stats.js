import pool from "../db/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const client = await pool.connect();

    // Total Members
    const totalMemberQuery = "SELECT COUNT(*) as total FROM Pengguna";
    const totalMemberResult = await client.query(totalMemberQuery);

      // Members Baru (Periode) - Tidak perlu filter
      const newMemberQuery = "SELECT COUNT(*) as total FROM Pengguna";
      const newMemberResult = await client.query(newMemberQuery);

    // Total Transaksi Masuk
    let totalTransaksiMasukQuery = "SELECT COUNT(*) as total FROM Transaksi_Masuk";
     if(startDate){
        totalTransaksiMasukQuery = totalTransaksiMasukQuery + " WHERE tanggal::DATE >= $1";
        if (endDate) {
          totalTransaksiMasukQuery = totalTransaksiMasukQuery + " AND tanggal::DATE <= $2"
        }
      }

    let totalTransaksiMasukValues = [];
    if(startDate) {
      totalTransaksiMasukValues = [startDate];
        if (endDate) {
          totalTransaksiMasukValues.push(endDate);
        }
    }
      
    const totalTransaksiMasukResult = await client.query(totalTransaksiMasukQuery, totalTransaksiMasukValues);

       // Total Transaksi Keluar
       let totalTransaksiKeluarQuery = "SELECT COUNT(*) as total FROM Transaksi_Keluar";
        if (startDate) {
          totalTransaksiKeluarQuery = totalTransaksiKeluarQuery + " WHERE tanggal::DATE >= $1";
          if(endDate) {
            totalTransaksiKeluarQuery = totalTransaksiKeluarQuery + " AND tanggal::DATE <= $2"
          }
       }

        let totalTransaksiKeluarValues = [];
        if(startDate){
            totalTransaksiKeluarValues = [startDate];
            if(endDate) {
                totalTransaksiKeluarValues.push(endDate)
            }
        }

      const totalTransaksiKeluarResult = await client.query(totalTransaksiKeluarQuery, totalTransaksiKeluarValues);

      // Nilai Total Transaksi (Periode)
      let nilaiTotalTransaksiQuery = `SELECT 
                                        COALESCE(SUM(ts.jumlah_sampah * h.harga_sampah), 0) AS total
                                        FROM Transaksi_Masuk tm
                                        JOIN Transaksi_Masuk_Sampah ts ON tm.transaksi_masuk_id = ts.transaksi_masuk_id
                                        JOIN Harga h ON ts.harga_id = h.harga_id`;

        if (startDate) {
           nilaiTotalTransaksiQuery = nilaiTotalTransaksiQuery + " WHERE tm.tanggal::DATE >= $1";

           if (endDate) {
              nilaiTotalTransaksiQuery = nilaiTotalTransaksiQuery + " AND tm.tanggal::DATE <= $2";
           }
        }

       let nilaiTotalTransaksiValues = []
       if(startDate) {
        nilaiTotalTransaksiValues = [startDate];
          if (endDate) {
            nilaiTotalTransaksiValues.push(endDate);
          }
        }

        const nilaiTotalTransaksiResult = await client.query(nilaiTotalTransaksiQuery, nilaiTotalTransaksiValues);

       let nilaiTotalTransaksiKeluarQuery = `SELECT
                                          COALESCE(SUM(ts.jumlah_sampah * h.harga_sampah), 0) AS total
                                          FROM Transaksi_Keluar tk
                                          JOIN Transaksi_Keluar_Sampah ts ON tk.transaksi_keluar_id = ts.transaksi_keluar_id
                                          JOIN Harga h ON ts.harga_id = h.harga_id`

        if(startDate){
            nilaiTotalTransaksiKeluarQuery = nilaiTotalTransaksiKeluarQuery + " WHERE tk.tanggal::DATE >= $1";

          if(endDate){
            nilaiTotalTransaksiKeluarQuery = nilaiTotalTransaksiKeluarQuery + " AND tk.tanggal::DATE <= $2"
          }
        }


        let nilaiTotalTransaksiKeluarValues = [];
        if (startDate) {
            nilaiTotalTransaksiKeluarValues = [startDate];
             if(endDate){
                nilaiTotalTransaksiKeluarValues.push(endDate)
            }
         }

          const nilaiTotalTransaksiKeluarResult = await client.query(nilaiTotalTransaksiKeluarQuery, nilaiTotalTransaksiKeluarValues);

  
      // Total Jenis Sampah
      const totalJenisSampahQuery = "SELECT COUNT(*) as total FROM Jenis_Sampah WHERE is_active=TRUE";
      const totalJenisSampahResult = await client.query(totalJenisSampahQuery);
  
         // Data Sampah (Terbanyak Kuantitas)
        const sampahTerbanyakKuantitasQuery = `SELECT s.nama_sampah, SUM(i.kuantitas) as total_kuantitas
                                               FROM Sampah s
                                               INNER JOIN Inventory_Sampah i ON s.sampah_id = i.sampah_id
                                               GROUP BY s.nama_sampah
                                               ORDER BY total_kuantitas DESC
                                               LIMIT 5`;
         const sampahTerbanyakKuantitasResult = await client.query(sampahTerbanyakKuantitasQuery);
  
      // Data Sampah (Terbanyak Nilai)
        const sampahTerbanyakNilaiQuery = `SELECT s.nama_sampah, SUM(h.harga_sampah) as total_nilai
                                          FROM Sampah s
                                          INNER JOIN Harga h ON s.harga_id_sekarang = h.harga_id
                                           GROUP BY s.nama_sampah
                                           ORDER BY total_nilai DESC
                                           LIMIT 5`;
        const sampahTerbanyakNilaiResult = await client.query(sampahTerbanyakNilaiQuery);
  
         // Total SUK
        const totalSukQuery = "SELECT COUNT(*) as total FROM SUK WHERE is_active=TRUE";
        const totalSukResult = await client.query(totalSukQuery);

          // Total Item Inventory
        const totalItemInventoryQuery = "SELECT COUNT(*) as total FROM Inventory_Sampah";
        const totalItemInventoryResult = await client.query(totalItemInventoryQuery);
  
       // Total Kuantitas Item Inventory
       const totalKuantitasInventoryQuery = "SELECT COALESCE(SUM(kuantitas), 0) AS total FROM Inventory_Sampah";
       const totalKuantitasInventoryResult = await client.query(totalKuantitasInventoryQuery);

       const itemTerbanyakInventoryQuery = `
                                          SELECT s.nama_sampah, i.kuantitas
                                          FROM Inventory_Sampah i
                                          INNER JOIN Sampah s ON s.sampah_id = i.sampah_id
                                          ORDER BY kuantitas DESC
                                          LIMIT 5
                                      `;
          const itemTerbanyakInventoryResult = await client.query(itemTerbanyakInventoryQuery);

    const response = {
        totalMembers: totalMemberResult.rows[0].total,
        newMembers: newMemberResult.rows[0].total,
        totalTransaksiMasuk: totalTransaksiMasukResult.rows[0].total,
        totalTransaksiKeluar: totalTransaksiKeluarResult.rows[0].total,
        nilaiTotalTransaksi: nilaiTotalTransaksiResult.rows[0].total,
        nilaiTotalTransaksiKeluar: nilaiTotalTransaksiKeluarResult.rows[0].total,
        totalJenisSampah: totalJenisSampahResult.rows[0].total,
        sampahTerbanyakKuantitas: sampahTerbanyakKuantitasResult.rows,
        sampahTerbanyakNilai: sampahTerbanyakNilaiResult.rows,
        totalSuk: totalSukResult.rows[0].total,
        totalItemInventory: totalItemInventoryResult.rows[0].total,
        totalKuantitasInventory: totalKuantitasInventoryResult.rows[0].total,
         itemTerbanyakInventory: itemTerbanyakInventoryResult.rows,
      };

      return res.json(response);
    } catch (error) {
      console.log(error);
      throw new InternalServerError("An unexpected error occurred");
    } finally {
      client.release();
    }
  };

