export function groupByTransaksiId(data) {
  const groupedData = [];

  data.forEach((item) => {
    let existingTransaksi = groupedData.find((group) => group.transaksi_id === item.transaksi_id);

    if (existingTransaksi) {
      // If the transaksi_id exists, push the current transaksiSampah item to the transaksiSampah array
      existingTransaksi.transaksiSampah.push({
        sampah_id: item.sampah_id,
        harga_id: item.harga_id,
        jumlah_sampah: item.jumlah_sampah,
        nama_sampah: item.nama_sampah,
        jenis_sampah_id: item.jenis_sampah_id,
        harga_sekarang: item.harga_sekarang,
        url_gambar: item.url_gambar,
        suk_id: item.suk_id,
        nama_suk: item.nama_suk, // Include nama_suk in the result
        is_active: item.is_active,
      });
    } else {
      // If transaksi_id doesn't exist, create a new entry
      groupedData.push({
        transaksi_id: item.transaksi_id,
        tanggal: item.tanggal,
        tipe_transaksi: item.tipe_transaksi,
        pengguna_id: item.pengguna_id,
        bs_pusat_id: item.bs_pusat_id,
        transaksiSampah: [
          {
            sampah_id: item.sampah_id,
            harga_id: item.harga_id,
            jumlah_sampah: item.jumlah_sampah,
            nama_sampah: item.nama_sampah,
            jenis_sampah_id: item.jenis_sampah_id,
            harga_sekarang: item.harga_sekarang,
            url_gambar: item.url_gambar,
            suk_id: item.suk_id,
            nama_suk: item.nama_suk, // Include nama_suk in the result
            is_active: item.is_active,
          },
        ],
      });
    }
  });

  return groupedData;
}
