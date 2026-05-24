const tipoComprobante = document.getElementById("tipoComprobante");
const dynamicForm = document.getElementById("dynamicForm");
const preview = document.getElementById("preview");
const limpiarBtn = document.getElementById("limpiarBtn");
const guardarBtn = document.getElementById("guardarBtn");

const fechaInput = document.getElementById("fecha");
fechaInput.valueAsDate = new Date();

const templates = {
  factura_venta: `
    <div class="section-title">
      <h3>Factura de venta</h3>
      <p>Formulario orientado a datos fiscales, cliente, ítems, impuestos, forma y medio de pago.</p>
    </div>

    <div class="form-block">
      <h4>Datos del emisor</h4>
      <div class="grid grid-3">
        <label>Razón social del emisor <input data-field="emisorRazonSocial" placeholder="Ej: Finanzas JL S.A.S"></label>
        <label>NIT del emisor <input data-field="emisorNit" placeholder="Ej: 901000000-1"></label>
        <label>Responsabilidad tributaria <input data-field="emisorResponsabilidad" placeholder="Ej: Responsable de IVA"></label>
        <label>Dirección <input data-field="emisorDireccion"></label>
        <label>Teléfono <input data-field="emisorTelefono"></label>
        <label>Correo <input data-field="emisorCorreo" type="email"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Datos del cliente / adquirente</h4>
      <div class="grid grid-3">
        <label>Nombre o razón social <input data-field="clienteNombre"></label>
        <label>NIT / Cédula <input data-field="clienteDocumento"></label>
        <label>Ciudad <input data-field="clienteCiudad"></label>
        <label>Dirección <input data-field="clienteDireccion"></label>
        <label>Teléfono <input data-field="clienteTelefono"></label>
        <label>Correo <input data-field="clienteCorreo" type="email"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Datos de la factura</h4>
      <div class="grid grid-4">
        <label>Prefijo <input data-field="prefijo" placeholder="FV"></label>
        <label>Número <input data-field="numeroFactura" placeholder="0001"></label>
        <label>Forma de pago
          <select data-field="formaPago">
            <option>Contado</option>
            <option>Crédito</option>
          </select>
        </label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Tarjeta débito</option>
            <option>Tarjeta crédito</option>
            <option>Otro</option>
          </select>
        </label>
        <label>Plazo en días <input data-field="plazoDias" type="number" min="0" value="0"></label>
        <label>Vendedor <input data-field="vendedor"></label>
        <label>Estado
          <select data-field="estado">
            <option>Borrador</option>
            <option>Emitida</option>
            <option>Anulada</option>
          </select>
        </label>
      </div>
    </div>

    ${itemsTableTemplate("venta")}

    <div class="form-block">
      <h4>Observaciones</h4>
      <textarea data-field="observaciones" placeholder="Notas, condiciones, información adicional..."></textarea>
    </div>
  `,

  factura_compra: `
    <div class="section-title">
      <h3>Factura de compra</h3>
      <p>Registro de facturas recibidas de proveedores para control de costos, gastos, IVA y cuentas por pagar.</p>
    </div>

    <div class="form-block">
      <h4>Proveedor</h4>
      <div class="grid grid-3">
        <label>Proveedor <input data-field="proveedorNombre"></label>
        <label>NIT / Cédula <input data-field="proveedorDocumento"></label>
        <label>Correo <input data-field="proveedorCorreo" type="email"></label>
        <label>Número factura proveedor <input data-field="numeroFacturaProveedor"></label>
        <label>CUFE / referencia electrónica <input data-field="cufe"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Condiciones</h4>
      <div class="grid grid-3">
        <label>Forma de pago
          <select data-field="formaPago">
            <option>Contado</option>
            <option>Crédito</option>
          </select>
        </label>
        <label>Centro de costo <input data-field="centroCosto"></label>
        <label>Cuenta contable gasto/costo <input data-field="cuentaContable" placeholder="Ej: 5135"></label>
      </div>
    </div>

    ${itemsTableTemplate("compra")}

    <div class="form-block">
      <h4>Observaciones</h4>
      <textarea data-field="observaciones"></textarea>
    </div>
  `,

  cuenta_pagar: `
    <div class="section-title">
      <h3>Cuenta por pagar</h3>
      <p>Control de obligaciones pendientes con proveedores, acreedores o terceros.</p>
    </div>

    <div class="form-block">
      <h4>Información de la obligación</h4>
      <div class="grid grid-3">
        <label>Proveedor / acreedor <input data-field="acreedorNombre"></label>
        <label>NIT / Cédula <input data-field="acreedorDocumento"></label>
        <label>Documento origen <input data-field="documentoOrigen" placeholder="Factura, cuenta de cobro, contrato..."></label>
        <label>Número documento <input data-field="numeroDocumento"></label>
        <label>Fecha causación <input data-field="fechaCausacion" type="date"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Valores</h4>
      <div class="grid grid-4">
        <label>Valor base <input data-field="valorBase" data-money type="number" value="0"></label>
        <label>IVA <input data-field="iva" data-money type="number" value="0"></label>
        <label>Retenciones <input data-field="retenciones" data-money type="number" value="0"></label>
        <label>Saldo pendiente <input data-field="saldoPendiente" data-money type="number" value="0"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Clasificación contable</h4>
      <div class="grid grid-3">
        <label>Cuenta por pagar <input data-field="cuentaPorPagar" placeholder="Ej: 2205"></label>
        <label>Cuenta gasto / activo <input data-field="cuentaContrapartida"></label>
        <label>Estado
          <select data-field="estado">
            <option>Pendiente</option>
            <option>Parcial</option>
            <option>Pagada</option>
          </select>
        </label>
      </div>
    </div>

    <div class="form-block">
      <h4>Concepto</h4>
      <textarea data-field="concepto"></textarea>
    </div>
  `,

  comprobante_egreso: `
    <div class="section-title">
      <h3>Comprobante de egreso</h3>
      <p>Soporte interno del pago realizado, con beneficiario, medio de pago, retenciones y asiento contable.</p>
    </div>

    <div class="form-block">
      <h4>Beneficiario</h4>
      <div class="grid grid-3">
        <label>Beneficiario <input data-field="beneficiarioNombre"></label>
        <label>NIT / Cédula <input data-field="beneficiarioDocumento"></label>
        <label>Concepto del pago <input data-field="conceptoPago"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado" placeholder="Factura / cuenta por pagar"></label>
        <label>Número referencia <input data-field="numeroReferencia"></label>
        <label>Fecha de pago <input data-field="fechaPago" type="date"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Información del pago</h4>
      <div class="grid grid-4">
        <label>Forma de pago
          <select data-field="formaPago">
            <option>Contado</option>
            <option>Crédito</option>
          </select>
        </label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Cheque</option>
            <option>Tarjeta</option>
            <option>Otro</option>
          </select>
        </label>
        <label>Banco / Caja <input data-field="bancoCaja"></label>
        <label>Número cheque / transferencia <input data-field="referenciaPago"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Valores</h4>
      <div class="grid grid-4">
        <label>Valor bruto <input data-field="valorBruto" data-money type="number" value="0"></label>
        <label>Retención en la fuente <input data-field="reteFuente" data-money type="number" value="0"></label>
        <label>Retención IVA <input data-field="reteIva" data-money type="number" value="0"></label>
        <label>Otras deducciones <input data-field="otrasDeducciones" data-money type="number" value="0"></label>
      </div>
      <div class="totals-box">
        <div class="totals-inner">
          <div class="total-row"><span>Valor neto pagado</span><strong id="netoEgreso">$ 0</strong></div>
        </div>
      </div>
    </div>

    <div class="form-block">
      <h4>Asiento contable</h4>
      <div class="grid grid-3">
        <label>Cuenta débito <input data-field="cuentaDebito" placeholder="Ej: 2205 Proveedores"></label>
        <label>Cuenta crédito <input data-field="cuentaCredito" placeholder="Ej: 1110 Bancos"></label>
        <label>Centro de costo <input data-field="centroCosto"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Control interno</h4>
      <div class="grid grid-3">
        <label>Elaboró <input data-field="elaboro"></label>
        <label>Revisó <input data-field="reviso"></label>
        <label>Aprobó <input data-field="aprobo"></label>
      </div>
      <br>
      <textarea data-field="observaciones" placeholder="Observaciones del pago..."></textarea>
    </div>
  `,

  recibo_caja: `
    <div class="section-title">
      <h3>Recibo de caja</h3>
      <p>Registro de dinero recibido por caja, banco o transferencia.</p>
    </div>

    <div class="form-block">
      <h4>Datos del tercero</h4>
      <div class="grid grid-3">
        <label>Cliente / tercero <input data-field="terceroNombre"></label>
        <label>NIT / Cédula <input data-field="terceroDocumento"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Ingreso recibido</h4>
      <div class="grid grid-4">
        <label>Concepto <input data-field="conceptoIngreso"></label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Tarjeta débito</option>
            <option>Tarjeta crédito</option>
            <option>Otro</option>
          </select>
        </label>
        <label>Caja / Banco <input data-field="cajaBanco"></label>
        <label>Referencia <input data-field="referencia"></label>
        <label>Valor recibido <input data-field="valorRecibido" data-money type="number" value="0"></label>
        <label>Retenciones descontadas <input data-field="retenciones" data-money type="number" value="0"></label>
        <label>Valor neto <input data-field="valorNeto" data-money type="number" value="0"></label>
      </div>
    </div>

    <div class="form-block">
      <h4>Clasificación contable</h4>
      <div class="grid grid-3">
        <label>Cuenta débito <input data-field="cuentaDebito" placeholder="Caja / Banco"></label>
        <label>Cuenta crédito <input data-field="cuentaCredito" placeholder="Cliente / Ingreso"></label>
        <label>Recibido por <input data-field="recibidoPor"></label>
      </div>
      <br>
      <textarea data-field="observaciones"></textarea>
    </div>
  `
};

function itemsTableTemplate(tipo) {
  return `
    <div class="form-block">
      <h4>Detalle de ítems</h4>
      <table class="items-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>V. unitario</th>
            <th>Desc.</th>
            <th>IVA %</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="itemsBody">
          ${itemRowTemplate()}
        </tbody>
      </table>

      <div class="table-actions">
        <button type="button" class="btn-small" id="addItemBtn">+ Agregar ítem</button>
      </div>

      <div class="totals-box">
        <div class="totals-inner">
          <div class="total-row"><span>Subtotal</span><strong id="subtotal">$ 0</strong></div>
          <div class="total-row"><span>Descuento</span><strong id="descuento">$ 0</strong></div>
          <div class="total-row"><span>IVA</span><strong id="ivaTotal">$ 0</strong></div>
          <div class="total-row"><span>Total</span><strong id="granTotal">$ 0</strong></div>
        </div>
      </div>
    </div>
  `;
}

function itemRowTemplate() {
  return `
    <tr class="item-row">
      <td><input data-item="codigo" placeholder="001"></td>
      <td><input data-item="descripcion" placeholder="Producto o servicio"></td>
      <td><input data-item="cantidad" type="number" value="1" min="0"></td>
      <td><input data-item="unidad" placeholder="Und"></td>
      <td><input data-item="valorUnitario" type="number" value="0" min="0"></td>
      <td><input data-item="descuento" type="number" value="0" min="0"></td>
      <td><input data-item="iva" type="number" value="0" min="0"></td>
      <td class="line-total">$ 0</td>
      <td><button type="button" class="btn-small remove-row">X</button></td>
    </tr>
  `;
}

tipoComprobante.addEventListener("change", () => {
  const selected = tipoComprobante.value;

  if (!selected) {
    dynamicForm.className = "card dynamic-form empty-state";
    dynamicForm.innerHTML = `
      <h3>Selecciona un tipo de comprobante</h3>
      <p>Cuando selecciones una opción, aquí aparecerán los campos contables.</p>
    `;
    updatePreview();
    return;
  }

  dynamicForm.className = "card dynamic-form";
  dynamicForm.innerHTML = templates[selected];
  bindDynamicEvents();
  updatePreview();
});

function bindDynamicEvents() {
  const addItemBtn = document.getElementById("addItemBtn");
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      document.getElementById("itemsBody").insertAdjacentHTML("beforeend", itemRowTemplate());
      bindDynamicEvents();
      calculateItems();
      updatePreview();
    });
  }

  dynamicForm.querySelectorAll("input, select, textarea").forEach(el => {
    el.removeEventListener("input", handleInput);
    el.addEventListener("input", handleInput);
    el.removeEventListener("change", handleInput);
    el.addEventListener("change", handleInput);
  });

  dynamicForm.querySelectorAll(".remove-row").forEach(btn => {
    btn.onclick = (e) => {
      const rows = dynamicForm.querySelectorAll(".item-row");
      if (rows.length > 1) {
        e.target.closest("tr").remove();
        calculateItems();
        updatePreview();
      }
    };
  });
}

function handleInput() {
  calculateItems();
  calculateEgreso();
  updatePreview();
}

function calculateItems() {
  const rows = dynamicForm.querySelectorAll(".item-row");
  let subtotal = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;
  let granTotal = 0;

  rows.forEach(row => {
    const cantidad = Number(row.querySelector('[data-item="cantidad"]')?.value || 0);
    const valorUnitario = Number(row.querySelector('[data-item="valorUnitario"]')?.value || 0);
    const descuento = Number(row.querySelector('[data-item="descuento"]')?.value || 0);
    const iva = Number(row.querySelector('[data-item="iva"]')?.value || 0);

    const base = cantidad * valorUnitario;
    const baseConDescuento = Math.max(base - descuento, 0);
    const ivaLinea = baseConDescuento * (iva / 100);
    const totalLinea = baseConDescuento + ivaLinea;

    subtotal += base;
    descuentoTotal += descuento;
    ivaTotal += ivaLinea;
    granTotal += totalLinea;

    const lineTotal = row.querySelector(".line-total");
    if (lineTotal) lineTotal.textContent = money(totalLinea);
  });

  setText("subtotal", money(subtotal));
  setText("descuento", money(descuentoTotal));
  setText("ivaTotal", money(ivaTotal));
  setText("granTotal", money(granTotal));
}

function calculateEgreso() {
  const valorBruto = Number(dynamicForm.querySelector('[data-field="valorBruto"]')?.value || 0);
  const reteFuente = Number(dynamicForm.querySelector('[data-field="reteFuente"]')?.value || 0);
  const reteIva = Number(dynamicForm.querySelector('[data-field="reteIva"]')?.value || 0);
  const otrasDeducciones = Number(dynamicForm.querySelector('[data-field="otrasDeducciones"]')?.value || 0);

  const neto = valorBruto - reteFuente - reteIva - otrasDeducciones;
  setText("netoEgreso", money(neto));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function money(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function collectData() {
  const data = {
    tipoComprobante: tipoComprobante.value,
    consecutivo: document.getElementById("consecutivo").value,
    fecha: document.getElementById("fecha").value,
    campos: {},
    items: []
  };

  dynamicForm.querySelectorAll("[data-field]").forEach(el => {
    data.campos[el.dataset.field] = el.value;
  });

  dynamicForm.querySelectorAll(".item-row").forEach(row => {
    const item = {};
    row.querySelectorAll("[data-item]").forEach(el => {
      item[el.dataset.item] = el.value;
    });
    if (Object.values(item).some(v => String(v).trim() !== "")) {
      data.items.push(item);
    }
  });

  return data;
}

function updatePreview() {
  preview.textContent = JSON.stringify(collectData(), null, 2);
}

guardarBtn.addEventListener("click", () => {
  const data = collectData();

  if (!data.tipoComprobante) {
    alert("Selecciona un tipo de comprobante.");
    return;
  }

  console.log("Comprobante guardado:", data);
  alert("Base lista: el comprobante se capturó en JSON. El siguiente paso es guardarlo en historial, localStorage o Firebase.");
});

limpiarBtn.addEventListener("click", () => {
  tipoComprobante.value = "";
  document.getElementById("consecutivo").value = "";
  fechaInput.valueAsDate = new Date();
  tipoComprobante.dispatchEvent(new Event("change"));
});

document.addEventListener("input", updatePreview);
document.addEventListener("change", updatePreview);
updatePreview();
