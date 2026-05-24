const state = {
  terceros: JSON.parse(localStorage.getItem("finanzasjl_terceros") || "[]"),
  inventario: JSON.parse(localStorage.getItem("finanzasjl_inventario") || "[]"),
  comprobantes: JSON.parse(localStorage.getItem("finanzasjl_comprobantes") || "[]")
};

const screens = {
  inicio: ["Inicio", "Panel general de Finanzas JL Pro."],
  nuevo: ["Nuevo comprobante", "Registra documentos contables conectados con terceros e inventario."],
  terceros: ["Terceros", "Administra clientes, proveedores, empleados y acreedores."],
  inventario: ["Inventario", "Administra productos, servicios, costos, precios, impuestos y stock."],
  historial: ["Historial", "Consulta los comprobantes registrados."],
  reportes: ["Reportes", "Base para reportes contables y administrativos."]
};

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const screen = btn.dataset.screen;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen).classList.add("active");

    document.getElementById("screenTitle").textContent = screens[screen][0];
    document.getElementById("screenSubtitle").textContent = screens[screen][1];
    renderAll();
  });
});

const tipoComprobante = document.getElementById("tipoComprobante");
const dynamicForm = document.getElementById("dynamicForm");
const preview = document.getElementById("preview");
const limpiarBtn = document.getElementById("limpiarBtn");
const guardarBtn = document.getElementById("guardarBtn");
const fechaInput = document.getElementById("fecha");
const terceroComprobante = document.getElementById("terceroComprobante");
const terceroResumen = document.getElementById("terceroResumen");

fechaInput.valueAsDate = new Date();

const templates = {
  factura_venta: `
    <div class="section-title">
      <h3>Factura de venta</h3>
      <p>Documento de venta con cliente, ítems, impuestos, forma y medio de pago.</p>
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

    ${itemsTableTemplate()}
    ${asientoVentaTemplate()}
    ${observacionesTemplate()}
  `,

  factura_compra: `
    <div class="section-title">
      <h3>Factura de compra</h3>
      <p>Registro de compras recibidas de proveedores para costos, gastos, IVA e inventario.</p>
    </div>

    <div class="form-block">
      <h4>Datos de la compra</h4>
      <div class="grid grid-4">
        <label>Número factura proveedor <input data-field="numeroFacturaProveedor"></label>
        <label>CUFE / referencia electrónica <input data-field="cufe"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
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

    ${itemsTableTemplate()}
    ${observacionesTemplate()}
  `,

  cuenta_pagar: `
    <div class="section-title">
      <h3>Cuenta por pagar</h3>
      <p>Control de obligaciones pendientes con proveedores, acreedores o terceros.</p>
    </div>

    <div class="form-block">
      <h4>Información de la obligación</h4>
      <div class="grid grid-3">
        <label>Documento origen <input data-field="documentoOrigen" placeholder="Factura, cuenta de cobro, contrato..."></label>
        <label>Número documento <input data-field="numeroDocumento"></label>
        <label>Fecha causación <input data-field="fechaCausacion" type="date"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
        <label>Cuenta por pagar <input data-field="cuentaPorPagar" placeholder="Ej: 2205"></label>
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
      <h4>Valores</h4>
      <div class="grid grid-4">
        <label>Valor base <input data-field="valorBase" data-money type="number" value="0"></label>
        <label>IVA <input data-field="iva" data-money type="number" value="0"></label>
        <label>Retenciones <input data-field="retenciones" data-money type="number" value="0"></label>
        <label>Saldo pendiente <input data-field="saldoPendiente" data-money type="number" value="0"></label>
      </div>
    </div>

    ${observacionesTemplate("Concepto")}
  `,

  comprobante_egreso: `
    <div class="section-title">
      <h3>Comprobante de egreso</h3>
      <p>Soporte interno del pago realizado, con beneficiario, medio de pago, retenciones y asiento contable.</p>
    </div>

    <div class="form-block">
      <h4>Información del pago</h4>
      <div class="grid grid-4">
        <label>Concepto del pago <input data-field="conceptoPago"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado" placeholder="Factura / cuenta por pagar"></label>
        <label>Número referencia <input data-field="numeroReferencia"></label>
        <label>Fecha de pago <input data-field="fechaPago" type="date"></label>
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
    </div>

    ${observacionesTemplate()}
  `,

  recibo_caja: `
    <div class="section-title">
      <h3>Recibo de caja</h3>
      <p>Registro de dinero recibido por caja, banco o transferencia.</p>
    </div>

    <div class="form-block">
      <h4>Ingreso recibido</h4>
      <div class="grid grid-4">
        <label>Concepto <input data-field="conceptoIngreso"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado"></label>
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
    </div>

    ${observacionesTemplate()}
  `
};

function itemsTableTemplate() {
  return `
    <div class="form-block">
      <h4>Detalle de ítems</h4>
      <table class="items-table">
        <thead>
          <tr>
            <th>Producto/servicio</th>
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
      <td>
        <select data-item="inventarioId" class="inventario-select">
          <option value="">Manual / seleccionar...</option>
          ${state.inventario.map(i => `<option value="${i.id}">${i.codigo} - ${i.nombre}</option>`).join("")}
        </select>
      </td>
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

function asientoVentaTemplate() {
  return `
    <div class="form-block">
      <h4>Asiento contable sugerido</h4>
      <div class="grid grid-3">
        <label>Débito <input data-field="cuentaDebito" placeholder="1305 Clientes / 1105 Caja"></label>
        <label>Crédito ingreso <input data-field="cuentaCreditoIngreso" placeholder="4135 Ingresos"></label>
        <label>Crédito IVA <input data-field="cuentaCreditoIva" placeholder="2408 IVA por pagar"></label>
      </div>
    </div>
  `;
}

function observacionesTemplate(title = "Observaciones") {
  return `
    <div class="form-block">
      <h4>${title}</h4>
      <textarea data-field="observaciones" placeholder="Notas, condiciones o información adicional..."></textarea>
    </div>
  `;
}

tipoComprobante.addEventListener("change", renderDynamicForm);
terceroComprobante.addEventListener("change", () => {
  renderTerceroResumen();
  updatePreview();
});

function renderDynamicForm() {
  const selected = tipoComprobante.value;

  if (!selected) {
    dynamicForm.className = "card dynamic-form empty-state";
    dynamicForm.innerHTML = `<h3>Selecciona un tipo de comprobante</h3><p>Cuando selecciones una opción, aquí aparecerán los campos contables.</p>`;
    updatePreview();
    return;
  }

  dynamicForm.className = "card dynamic-form";
  dynamicForm.innerHTML = templates[selected];
  bindDynamicEvents();
  updatePreview();
}

function bindDynamicEvents() {
  const addItemBtn = document.getElementById("addItemBtn");
  if (addItemBtn) {
    addItemBtn.onclick = () => {
      const body = document.getElementById("itemsBody");
      if (!body) return;
      body.insertAdjacentHTML("beforeend", itemRowTemplate());
      bindDynamicEvents();
      calculateItems();
      updatePreview();
    };
  }

  dynamicForm.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.classList.contains("inventario-select")) return;
    el.oninput = handleInput;
    el.onchange = handleInput;
  });

  dynamicForm.querySelectorAll(".remove-row").forEach(btn => {
    btn.onclick = (e) => {
      const rows = dynamicForm.querySelectorAll(".item-row");
      if (rows.length > 1) {
        e.target.closest("tr").remove();
        calculateItems();
        updatePreview();
      } else {
        alert("Debe quedar mínimo un ítem.");
      }
    };
  });

  dynamicForm.querySelectorAll(".inventario-select").forEach(select => {
    select.onchange = (e) => {
      fillItemFromInventory(e.target);
      calculateItems();
      updatePreview();
    };
  });
}

function fillItemFromInventory(select) {
  const row = select.closest("tr");
  if (!row) return;

  if (!select.value) {
    row.querySelector('[data-item="codigo"]').value = "";
    row.querySelector('[data-item="descripcion"]').value = "";
    row.querySelector('[data-item="unidad"]').value = "";
    row.querySelector('[data-item="valorUnitario"]').value = "0";
    row.querySelector('[data-item="iva"]').value = "0";
    calculateItems();
    updatePreview();
    return;
  }

  const item = state.inventario.find(i => String(i.id) === String(select.value));
  if (!item) {
    console.warn("No se encontró el ítem de inventario:", select.value, state.inventario);
    return;
  }

  row.querySelector('[data-item="codigo"]').value = item.codigo || "";
  row.querySelector('[data-item="descripcion"]').value = item.nombre || "";
  row.querySelector('[data-item="unidad"]').value = item.unidad || "Und";
  row.querySelector('[data-item="valorUnitario"]').value = Number(item.precio || 0);
  row.querySelector('[data-item="iva"]').value = Number(item.iva || 0);

  calculateItems();
  updatePreview();
}

function handleInput() {
  calculateItems();
  calculateEgreso();
  updatePreview();
}

function calculateItems() {
  const rows = dynamicForm.querySelectorAll(".item-row");
  let subtotal = 0, descuentoTotal = 0, ivaTotal = 0, granTotal = 0;

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

    row.querySelector(".line-total").textContent = money(totalLinea);
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
  setText("netoEgreso", money(valorBruto - reteFuente - reteIva - otrasDeducciones));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function money(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value || 0);
}

function collectData() {
  const tercero = state.terceros.find(t => t.id === terceroComprobante.value) || null;

  const data = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    tipoComprobante: tipoComprobante.value,
    consecutivo: document.getElementById("consecutivo").value,
    fecha: document.getElementById("fecha").value,
    tercero,
    campos: {},
    items: [],
    total: getTotalCurrentForm()
  };

  dynamicForm.querySelectorAll("[data-field]").forEach(el => {
    data.campos[el.dataset.field] = el.value;
  });

  dynamicForm.querySelectorAll(".item-row").forEach(row => {
    const item = {};
    row.querySelectorAll("[data-item]").forEach(el => {
      item[el.dataset.item] = el.value;
    });
    if (Object.values(item).some(v => String(v).trim() !== "")) data.items.push(item);
  });

  return data;
}

function getTotalCurrentForm() {
  const rows = dynamicForm.querySelectorAll(".item-row");
  let total = 0;
  rows.forEach(row => {
    const cantidad = Number(row.querySelector('[data-item="cantidad"]')?.value || 0);
    const valorUnitario = Number(row.querySelector('[data-item="valorUnitario"]')?.value || 0);
    const descuento = Number(row.querySelector('[data-item="descuento"]')?.value || 0);
    const iva = Number(row.querySelector('[data-item="iva"]')?.value || 0);
    const base = Math.max(cantidad * valorUnitario - descuento, 0);
    total += base + base * (iva / 100);
  });

  if (!rows.length && tipoComprobante.value === "comprobante_egreso") {
    const valorBruto = Number(dynamicForm.querySelector('[data-field="valorBruto"]')?.value || 0);
    const reteFuente = Number(dynamicForm.querySelector('[data-field="reteFuente"]')?.value || 0);
    const reteIva = Number(dynamicForm.querySelector('[data-field="reteIva"]')?.value || 0);
    const otrasDeducciones = Number(dynamicForm.querySelector('[data-field="otrasDeducciones"]')?.value || 0);
    total = valorBruto - reteFuente - reteIva - otrasDeducciones;
  }

  if (!rows.length && tipoComprobante.value === "recibo_caja") {
    total = Number(dynamicForm.querySelector('[data-field="valorNeto"]')?.value || 0);
  }

  if (!rows.length && tipoComprobante.value === "cuenta_pagar") {
    total = Number(dynamicForm.querySelector('[data-field="saldoPendiente"]')?.value || 0);
  }

  return total;
}

function updatePreview() {
  preview.textContent = JSON.stringify(collectData(), null, 2);
}

guardarBtn.addEventListener("click", () => {
  const data = collectData();
  if (!data.tipoComprobante) return alert("Selecciona un tipo de comprobante.");
  if (!data.tercero) return alert("Selecciona un tercero.");

  state.comprobantes.push(data);
  saveState();
  renderAll();
  alert("Comprobante guardado en historial local.");
});

limpiarBtn.addEventListener("click", () => {
  tipoComprobante.value = "";
  document.getElementById("consecutivo").value = "";
  terceroComprobante.value = "";
  fechaInput.valueAsDate = new Date();
  renderTerceroResumen();
  renderDynamicForm();
});

function renderTerceroResumen() {
  const tercero = state.terceros.find(t => t.id === terceroComprobante.value);
  if (!tercero) {
    terceroResumen.classList.add("hidden");
    terceroResumen.textContent = "";
    return;
  }

  terceroResumen.classList.remove("hidden");
  terceroResumen.textContent = `${tercero.tipo} | ${tercero.nombre} | ${tercero.tipoId}: ${tercero.numeroId} | ${tercero.responsabilidad}`;
}

/* TERCEROS */
document.getElementById("guardarTerceroBtn").addEventListener("click", () => {
  const tercero = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    tipo: val("terceroTipo"),
    tipoId: val("terceroTipoId"),
    numeroId: val("terceroNumeroId"),
    dv: val("terceroDv"),
    nombre: val("terceroNombre"),
    responsabilidad: val("terceroResponsabilidad"),
    ciudad: val("terceroCiudad"),
    direccion: val("terceroDireccion"),
    telefono: val("terceroTelefono"),
    correo: val("terceroCorreo"),
    cuenta: val("terceroCuenta"),
    estado: val("terceroEstado"),
    observaciones: val("terceroObservaciones")
  };

  if (!tercero.numeroId || !tercero.nombre) return alert("El tercero necesita identificación y nombre.");

  state.terceros.push(tercero);
  saveState();
  limpiarTercero();
  renderAll();
  alert("Tercero guardado.");
});

document.getElementById("limpiarTerceroBtn").addEventListener("click", limpiarTercero);

function limpiarTercero() {
  ["terceroNumeroId","terceroDv","terceroNombre","terceroCiudad","terceroDireccion","terceroTelefono","terceroCorreo","terceroCuenta","terceroObservaciones"].forEach(id => document.getElementById(id).value = "");
}

/* INVENTARIO */
document.getElementById("guardarItemBtn").addEventListener("click", () => {
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    tipo: val("itemTipo"),
    codigo: val("itemCodigo"),
    nombre: val("itemNombre"),
    unidad: val("itemUnidad"),
    categoria: val("itemCategoria"),
    costo: Number(val("itemCosto") || 0),
    precio: Number(val("itemPrecio") || 0),
    iva: Number(val("itemIva") || 0),
    stock: Number(val("itemStock") || 0),
    stockMinimo: Number(val("itemStockMinimo") || 0),
    cuentaIngreso: val("itemCuentaIngreso"),
    cuentaCosto: val("itemCuentaCosto"),
    observaciones: val("itemObservaciones")
  };

  if (!item.codigo || !item.nombre) return alert("El producto/servicio necesita código y nombre.");

  state.inventario.push(item);
  saveState();
  limpiarItem();
  renderAll();
  renderDynamicForm();
  alert("Producto/servicio guardado.");
});

document.getElementById("limpiarItemBtn").addEventListener("click", limpiarItem);

function limpiarItem() {
  ["itemCodigo","itemNombre","itemCategoria","itemCuentaIngreso","itemCuentaCosto","itemObservaciones"].forEach(id => {
    document.getElementById(id).value = "";
  });

  ["itemCosto","itemPrecio","itemIva","itemStock","itemStockMinimo"].forEach(id => {
    document.getElementById(id).value = "0";
  });
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function saveState() {
  localStorage.setItem("finanzasjl_terceros", JSON.stringify(state.terceros));
  localStorage.setItem("finanzasjl_inventario", JSON.stringify(state.inventario));
  localStorage.setItem("finanzasjl_comprobantes", JSON.stringify(state.comprobantes));
}

/* RENDER */
function renderAll() {
  renderTerceros();
  renderInventario();
  renderTerceroOptions();
  renderHistorial();
  renderMetrics();
  renderTerceroResumen();
  updatePreview();
}

function renderTerceros() {
  const tbody = document.getElementById("tercerosTable");
  tbody.innerHTML = state.terceros.map(t => `
    <tr>
      <td>${t.tipo}</td>
      <td>${t.tipoId} ${t.numeroId}${t.dv ? "-" + t.dv : ""}</td>
      <td>${t.nombre}</td>
      <td>${t.responsabilidad}</td>
      <td>${t.ciudad}</td>
      <td>${t.correo}</td>
    </tr>
  `).join("") || `<tr><td colspan="6">No hay terceros registrados.</td></tr>`;
}

function renderInventario() {
  const tbody = document.getElementById("inventarioTable");
  tbody.innerHTML = state.inventario.map(i => `
    <tr>
      <td>${i.tipo}</td>
      <td>${i.codigo}</td>
      <td>${i.nombre}</td>
      <td>${i.unidad}</td>
      <td>${money(i.costo)}</td>
      <td>${money(i.precio)}</td>
      <td>${i.iva}%</td>
      <td>${i.stock}</td>
    </tr>
  `).join("") || `<tr><td colspan="8">No hay productos o servicios registrados.</td></tr>`;
}

function renderTerceroOptions() {
  const current = terceroComprobante.value;
  terceroComprobante.innerHTML = `<option value="">Seleccionar tercero...</option>` + state.terceros
    .filter(t => t.estado === "Activo")
    .map(t => `<option value="${t.id}">${t.nombre} - ${t.numeroId}</option>`)
    .join("");
  terceroComprobante.value = current;
}

function renderHistorial() {
  const tbody = document.getElementById("historialTable");
  tbody.innerHTML = state.comprobantes.map(c => `
    <tr>
      <td>${c.fecha}</td>
      <td>${labelTipo(c.tipoComprobante)}</td>
      <td>${c.consecutivo}</td>
      <td>${c.tercero?.nombre || ""}</td>
      <td>${money(c.total)}</td>
    </tr>
  `).join("") || `<tr><td colspan="5">No hay comprobantes registrados.</td></tr>`;
}

function renderMetrics() {
  document.getElementById("metricTerceros").textContent = state.terceros.length;
  document.getElementById("metricInventario").textContent = state.inventario.length;

  const ingresos = state.comprobantes
    .filter(c => ["factura_venta", "recibo_caja"].includes(c.tipoComprobante))
    .reduce((acc, c) => acc + Number(c.total || 0), 0);

  const gastos = state.comprobantes
    .filter(c => ["factura_compra", "comprobante_egreso", "cuenta_pagar"].includes(c.tipoComprobante))
    .reduce((acc, c) => acc + Number(c.total || 0), 0);

  document.getElementById("metricIngresos").textContent = money(ingresos);
  document.getElementById("metricGastos").textContent = money(gastos);
}

function labelTipo(tipo) {
  const labels = {
    factura_venta: "Factura de venta",
    factura_compra: "Factura de compra",
    cuenta_pagar: "Cuenta por pagar",
    comprobante_egreso: "Comprobante de egreso",
    recibo_caja: "Recibo de caja"
  };
  return labels[tipo] || tipo;
}

renderAll();
renderDynamicForm();
