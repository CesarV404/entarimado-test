import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#eeeeee",
  },
  tableCell: {
    fontSize: 10,
  },
});

export const TablaPDF = ({ items }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.table}>
        {/* Header */}
        <View
          style={{
            ...styles.tableRow,
            display: "flex",
            justifyContent: "space-between",
            borderRight: "1pt solid #000",
          }}
        >
          <Text
            style={{ ...styles.tableCell, fontSize: 24, fontWeight: "bold" }}
          >
            No. de Tarima:
          </Text>
          <Text
            style={{
              ...styles.tableCell,
              fontSize: 12,
              fontWeight: "bold",
              padding: 2,
            }}
          >
            {new Date().toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.tableHeader]}>
            <Text style={styles.tableCell}>No.</Text>
          </View>
          <View style={[styles.tableCol, styles.tableHeader]}>
            <Text style={styles.tableCell}>Upc</Text>
          </View>
          <View style={[styles.tableCol, styles.tableHeader]}>
            <Text style={styles.tableCell}>Descripción</Text>
          </View>
          <View style={[styles.tableCol, styles.tableHeader]}>
            <Text style={styles.tableCell}>Piezas</Text>
          </View>
        </View>

        {/* Fila 1 */}
        {items.map((item) => (
          <View key={item.codigo} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.position}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.codigo}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.descripcion}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.piezas}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
