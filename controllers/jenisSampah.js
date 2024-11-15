export const getJenisSampah = async (req, res) => {
  return res.json("get jenis sampah");
};

export const createJenisSampah = async (req, res) => {
  return res.json("create jenis sampah");
};

export const updateJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("update jenis sampah" + jenisSampahId);
};

export const deleteJenisSampah = async (req, res) => {
  const { jenisSampahId } = req.params;
  return res.json("delete jenis sampah" + jenisSampahId);
};
