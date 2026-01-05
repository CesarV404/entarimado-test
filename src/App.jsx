import { useState } from "react";
import { TablaPDF } from "./pdf-template";
import { pdf } from "@react-pdf/renderer";

import { useTagStore } from "./store";
import JsBarcode from "jsbarcode";

import {
  BarcodeDetector,
  ZXING_WASM_VERSION,
  prepareZXingModule,
} from "barcode-detector/ponyfill";

prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => {
      if (path.endsWith(".wasm")) {
        return `https://unpkg.com/zxing-wasm@${ZXING_WASM_VERSION}/dist/reader/${path}`;
      }
      return prefix + path;
    },
  },
});

const barcodeDetector = new BarcodeDetector({
  formats: ["upc_a", "ean_13", "code_128"],
});

const searchData = [
  { codigo: "123456789012", descripcion: "Producto 1", piezas: 10 },
  { codigo: "987654321098", descripcion: "Producto 2", piezas: 5 },
  { codigo: "123456789012", descripcion: "Producto 1", piezas: 1 },
];

export default function App() {
  const db = useTagStore((state) => state.db);
  const setDB = useTagStore((state) => state.setDB);
  const productList = useTagStore((state) => state.productList);
  const { addProduct, removeProduct, deleteList } = useTagStore(
    (state) => state
  );

  const [form, setForm] = useState({
    descripcion: "",
    codigo: "",
    piezas: "",
    barcodeImg: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar extensión
    if (file.type !== "application/json") {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        console.log(parsed);
        setDB(parsed);
      } catch {
        setDB([]);
      }
    };

    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      [e.target.name]: value,
    });
  };

  const agregarItem = () => {
    if (!form.descripcion || !form.codigo || !form.piezas) return;

    addProduct({ ...form, id: Date.now(), position: productList.length + 1 });

    setForm({
      descripcion: "",
      codigo: "",
      piezas: "",
      barcodeImg: null,
    });
  };

  function generarBarcodeBlob(valor) {
    return new Promise((resolve, format) => {
      const canvas = document.createElement("canvas");

      JsBarcode(canvas, valor, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }

  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    barcodeDetector.detect(file).then(async (barcodes) => {
      console.log(barcodes);

      if (barcodes.length === 0) {
        return setForm({
          ...form,
          codigo: "000000000000",
        });
      }

      const barcodeValue = barcodes[0].rawValue;
      const barcodeCleaned =
        String(barcodeValue)[0] === "0"
          ? String(barcodeValue).slice(1)
          : String(barcodeValue);

      const realFormat = barcodeCleaned.length === 12 ? "upc_a" : "ean_13";

      const barcodeImgBlob = await generarBarcodeBlob(
        String(barcodeCleaned),
        realFormat
      );

      const base64Barcode = await blobToBase64(barcodeImgBlob);
      console.log(base64Barcode);

      setForm({
        ...form,
        codigo: barcodeCleaned,
        barcodeImg: base64Barcode,
      });
    });
  };

  const generarPDF = async (items) => {
    console.log("Generando PDF...", items);
    const blob = await pdf(<TablaPDF items={items} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relacion.pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div>{db.length > 0 ? "Base de datos cargada" : "No hay datos aun"}</div>
      <input
        style={{ marginBottom: "20px" }}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
      />
      <br />
      <input
        name="codigo"
        type="number"
        placeholder="Código numérico"
        maxLength={13}
        value={form.codigo}
        onChange={(e) => {
          const value = e.target.value;
          const valueFound = db.filter((item) => item.upc === value);

          if (valueFound.length === 1) {
            setForm({
              descripcion: "",
              codigo: "",
              piezas: "",
              barcodeImg: null,
            });

            addProduct({
              descripcion: valueFound[0].name,
              codigo: valueFound[0].upc,
              piezas: valueFound[0].pieces,
              id: Date.now(),
              position: productList.length + 1,
            });
            return;
          }

          if (valueFound.length >= 2) {
            setForm({
              descripcion: valueFound[0].name,
              codigo: valueFound[0].upc,
              piezas: "",
              barcodeImg: null,
            });
            return;
          }

          handleChange(e);
        }}
      />

      <br />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhoto}
      />
      <br />

      <h2>Registro</h2>

      {/* FORMULARIO */}
      <div style={{ marginBottom: 20 }}>
        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <br />

        <input
          name="piezas"
          type="number"
          placeholder="Piezas"
          value={form.piezas}
          onChange={handleChange}
        />
        <br />
        <br />

        <button onClick={agregarItem}>Agregar</button>
      </div>

      {/* LISTA */}
      <h3>Lista - Productos: {productList.length}</h3>

      {productList.length === 0 && <p>No hay registros</p>}

      {/* ACCIONES */}
      {productList.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={deleteList}>Borrar lista</button>{" "}
          <button onClick={async () => generarPDF(productList)}>
            Imprimir
          </button>
        </div>
      )}

      {productList.map((item) => (
        <div
          key={item.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <p>
            <b>Descripción:</b> {item.descripcion}
          </p>
          <p>
            <b>Código:</b> {item.codigo}
          </p>
          <p>
            <b>Piezas:</b> {item.piezas}
          </p>

          <button onClick={() => removeProduct(item.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
