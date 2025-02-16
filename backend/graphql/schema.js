const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Custom scalar to hold JSON data
  scalar JSON

  # Dicom type definition
  type Dicom {
    id: ID!
    PatientName: String
    PatientBirthDate: String
    SeriesDescription: String
    image: String
    metadata: JSON
  }

  # Query type for GraphQL API
  type Query {
    # Get a single DICOM by ID
    getDicom(id: ID!): Dicom

    # Get all DICOMs
    getAllDicoms: [Dicom]
  }
`;

module.exports = typeDefs;
