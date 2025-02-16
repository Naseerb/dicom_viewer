const Dicom = require('../models/Dicom');

const resolvers = {
  Query: {
    getDicom: async (_, { id }) => {
      try {
        const dicom = await Dicom.findById(id);
        return dicom;
      } catch (err) {
        throw new Error('Dicom not found');
      }
    },
    getAllDicoms: async () => {
      try {
        const dicoms = await Dicom.find({});
        return dicoms;
      } catch (err) {
        throw new Error('Error fetching DICOM data');
      }
    },
  },
};

module.exports = resolvers;
