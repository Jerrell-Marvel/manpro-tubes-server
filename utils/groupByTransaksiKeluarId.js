export const groupByTransaksiKeluarId = (data) => {
  const groupedData = data.reduce((result, item) => {
    const { transaksi_keluar_id, tanggal, bs_pusat_id, ...sampahData } = item;
    let transaksi = result.find((t) => t.transaksi_keluar_id === transaksi_keluar_id);
    if (!transaksi) {
      transaksi = {
        transaksi_keluar_id,
        tanggal,
        bs_pusat_id,
        transaksiSampah: [],
      };
      result.push(transaksi);
    }

    transaksi.transaksiSampah.push(sampahData);

    return result;
  }, []);

  return groupedData;
};
