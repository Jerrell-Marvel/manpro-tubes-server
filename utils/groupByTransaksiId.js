export function groupByTransaksiId(data) {
  // Group the data by `transaksi_masuk_id`
  const groupedData = data.reduce((result, item) => {
    const { transaksi_masuk_id, tanggal, pengguna_id, ...sampahData } = item;

    // Find or create the transaksi object
    let transaksi = result.find((t) => t.transaksi_masuk_id === transaksi_masuk_id);
    if (!transaksi) {
      transaksi = {
        transaksi_masuk_id,
        tanggal,
        pengguna_id,
        transaksiSampah: [],
      };
      result.push(transaksi);
    }

    // Add the current sampah data to the transaksiSampah array
    transaksi.transaksiSampah.push(sampahData);

    return result;
  }, []);

  return groupedData;
}
