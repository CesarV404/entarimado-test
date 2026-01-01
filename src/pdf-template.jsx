// Ticket.jsx
import {
  View,
  Text,
  StyleSheet,
  Page,
  Document,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  ticket: {
    width: 240,
    height: 148.75,
    border: "1pt solid #000",
    padding: 8,
    margin: "0 6",
    fontSize: 9,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  logo: {
    fontWeight: "bold",
  },

  fecha: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1pt solid #000",
    padding: 2,
    fontSize: 8,
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
  },

  label: {
    fontWeight: "bold",
  },

  label2: {
    fontWeight: "bold",
    textDecoration: "underline",
    textDecorationStyle: "1pt solid #000",
  },

  line: {
    flex: 1,
    borderBottom: "1pt solid #000",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  barcodeBox: {
    width: "65%",
    height: 45,
    border: "1pt solid #000",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8,
  },

  piecesBox: {
    width: "30%",
    height: 45,
    border: "1pt solid #000",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
});

const Ticket = ({
  descripcion,
  codigo,
  hechoPor,
  superviso,
  piezas,
  barcodeImg,
}) => (
  <View style={styles.ticket}>
    {/* Header */}
    <View style={styles.header}>
      <Image
        source="/public/grupo-vizion-logo.jpeg"
        style={{
          width: 25,
          height: 25,
        }}
      />
      <Text style={styles.fecha}>
        {new Date().toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </Text>
    </View>

    {/* Campos */}
    <View style={styles.row}>
      <Text style={styles.label}>DESCRIPCIÓN: </Text>
      <Text style={styles.label2}>{descripcion}</Text>
      <View style={styles.line} />
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>CÓDIGO NUMÉRICO: </Text>
      <Text style={styles.label2}>{codigo}</Text>
      <View style={styles.line} />
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>HECHO POR: </Text>
      <Text style={styles.label2}>{hechoPor}</Text>
      <View style={styles.line} />
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>SUPERVISÓ: </Text>
      <Text style={styles.label2}>{superviso}</Text>
      <View style={styles.line} />
    </View>

    {/* Parte inferior */}
    <View style={styles.bottomRow}>
      <View style={styles.barcodeBox}>
        <Image source={barcodeImg} style={{ margin: 2, padding: 0 }} />
        <Text style={styles.label}>{codigo}</Text>
      </View>

      <View style={styles.piecesBox}>
        <Text style={{ fontWeight: "bold", fontSize: 24 }}>{piezas}</Text>
      </View>
    </View>
  </View>
);

export const MyDocument = ({ items }) => (
  <Document>
    <Page size="A4" orientation="landscape">
      <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {items.map((marvetData, i) => (
          <Ticket
            key={i}
            descripcion={marvetData.descripcion}
            codigo={marvetData.codigo}
            hechoPor={marvetData.hechoPor}
            superviso={marvetData.superviso}
            piezas={marvetData.piezas}
            barcodeImg={marvetData.barcodeImg}
          />
        ))}
      </View>
    </Page>
  </Document>
);
