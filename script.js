const $ = (id) => document.getElementById(id);

const state = {
  terceros: JSON.parse(localStorage.getItem("fjl_terceros") || "[]"),
  inventario: JSON.parse(localStorage.getItem("fjl_inventario") || "[]"),
  comprobantes: JSON.parse(localStorage.getItem("fjl_comprobantes") || "[]"),
  asientos: JSON.parse(localStorage.getItem("fjl_asientos") || "[]"),
  cxc: JSON.parse(localStorage.getItem("fjl_cxc") || "[]"),
  cxp: JSON.parse(localStorage.getItem("fjl_cxp") || "[]"),
  kardex: JSON.parse(localStorage.getItem("fjl_kardex") || "[]"),
  selectedTerceroId: null,
  activeItemRow: null,
  modalMode: null
};

const screens = {
  inicio: ["Inicio", "Sistema contable integrado para comprobantes, terceros e inventario."],
  nuevo: ["Nuevo comprobante", "Busca terceros e ítems dentro de cada documento."],
  terceros: ["Terceros", "Administra clientes, proveedores, empleados y acreedores."],
  inventario: ["Inventario", "Administra productos, servicios, costos, precios, impuestos y stock."],
  historial: ["Historial", "Imprime y consulta comprobantes guardados."],
  cartera: ["Cartera", "Consulta cuentas por cobrar y por pagar generadas automáticamente."],
  reportes: ["Reportes", "Consulta asientos contables y kardex básico."]
};

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const screen = btn.dataset.screen;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(screen).classList.add("active");
    $("screenTitle").textContent = screens[screen][0];
    $("screenSubtitle").textContent = screens[screen][1];
    renderAll();
  });
});

$("fecha").valueAsDate = new Date();

const templates = {
  factura_venta: `
    <div class="section-title">
      <h3>Factura de venta</h3>
      <p>Al guardar, genera ingreso, CxC si es crédito, asiento básico y salida de inventario si aplica.</p>
    </div>
    ${datosPagoTemplate()}
    ${itemsTableTemplate()}
    ${asientoSugeridoTemplate("venta")}
    ${observacionesTemplate()}
  `,
  factura_compra: `
    <div class="section-title">
      <h3>Factura de compra</h3>
      <p>Al guardar, genera compra/gasto, CxP si es crédito, asiento básico y entrada de inventario si aplica.</p>
    </div>
    <div class="form-block">
      <h4>Datos de compra</h4>
      <div class="grid grid-4">
        <label>Factura proveedor <input data-field="facturaProveedor"></label>
        <label>CUFE / referencia <input data-field="cufe"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
        <label>Centro de costo <input data-field="centroCosto"></label>
      </div>
    </div>
    ${datosPagoTemplate()}
    ${itemsTableTemplate()}
    ${asientoSugeridoTemplate("compra")}
    ${observacionesTemplate()}
  `,
  cuenta_pagar: `
    <div class="section-title">
      <h3>Cuenta por pagar</h3>
      <p>Registra una obligación pendiente con tercero y genera CxP.</p>
    </div>
    <div class="form-block">
      <h4>Obligación</h4>
      <div class="grid grid-4">
        <label>Documento origen <input data-field="documentoOrigen"></label>
        <label>Número documento <input data-field="numeroDocumento"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
        <label>Cuenta contable <input data-field="cuenta" placeholder="2205"></label>
        <label>Valor base <input data-field="valorBase" type="number" value="0"></label>
        <label>IVA <input data-field="iva" type="number" value="0"></label>
        <label>Retenciones <input data-field="retenciones" type="number" value="0"></label>
        <label>Saldo pendiente <input data-field="saldo" type="number" value="0"></label>
      </div>
    </div>
    ${observacionesTemplate("Concepto")}
  `,
  comprobante_egreso: `
    <div class="section-title">
      <h3>Comprobante de egreso</h3>
      <p>Registra un pago. Imprime comprobante con beneficiario, deducciones y medio de pago.</p>
    </div>
    <div class="form-block">
      <h4>Información del pago</h4>
      <div class="grid grid-4">
        <label>Concepto <input data-field="concepto"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado"></label>
        <label>Fecha pago <input data-field="fechaPago" type="date"></label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option><option>Transferencia</option><option>Cheque</option><option>Tarjeta</option><option>Otro</option>
          </select>
        </label>
        <label>Banco / caja <input data-field="bancoCaja"></label>
        <label>Referencia pago <input data-field="referenciaPago"></label>
        <label>Valor bruto <input data-field="valorBruto" type="number" value="0"></label>
        <label>ReteFuente <input data-field="reteFuente" type="number" value="0"></label>
        <label>ReteIVA <input data-field="reteIva" type="number" value="0"></label>
        <label>Otras deducciones <input data-field="otrasDeducciones" type="number" value="0"></label>
      </div>
      <div class="totals-box"><div class="totals-inner">
        <div class="total-row"><span>Neto pagado</span><strong id="netoEgreso">$ 0</strong></div>
      </div></div>
    </div>
    ${asientoSugeridoTemplate("egreso")}
    ${observacionesTemplate()}
  `,
  recibo_caja: `
    <div class="section-title">
      <h3>Recibo de caja</h3>
      <p>Registra entrada de dinero. Imprime recibo para entregar al tercero.</p>
    </div>
    <div class="form-block">
      <h4>Ingreso recibido</h4>
      <div class="grid grid-4">
        <label>Concepto <input data-field="concepto"></label>
        <label>Documento relacionado <input data-field="documentoRelacionado"></label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option><option>Transferencia</option><option>Tarjeta débito</option><option>Tarjeta crédito</option><option>Otro</option>
          </select>
        </label>
        <label>Caja / banco <input data-field="cajaBanco"></label>
        <label>Referencia <input data-field="referencia"></label>
        <label>Valor recibido <input data-field="valorRecibido" type="number" value="0"></label>
        <label>Retenciones <input data-field="retenciones" type="number" value="0"></label>
        <label>Valor neto <input data-field="valorNeto" type="number" value="0"></label>
      </div>
    </div>
    ${asientoSugeridoTemplate("recibo")}
    ${observacionesTemplate()}
  `
};

function datosPagoTemplate() {
  return `
    <div class="form-block">
      <h4>Forma y medio de pago</h4>
      <div class="grid grid-4">
        <label>Forma de pago
          <select data-field="formaPago">
            <option>Contado</option>
            <option>Crédito</option>
          </select>
        </label>
        <label>Medio de pago
          <select data-field="medioPago">
            <option>Efectivo</option><option>Transferencia</option><option>Tarjeta débito</option><option>Tarjeta crédito</option><option>Otro</option>
          </select>
        </label>
        <label>Plazo días <input data-field="plazoDias" type="number" value="0"></label>
        <label>Fecha vencimiento <input data-field="fechaVencimiento" type="date"></label>
      </div>
    </div>
  `;
}

function itemsTableTemplate() {
  return `
    <div class="form-block">
      <h4>Detalle de ítems</h4>
      <table class="items-table">
        <thead>
          <tr>
            <th>Buscar</th><th>Código</th><th>Descripción</th><th>Cant.</th><th>Unidad</th><th>V. unitario</th><th>Desc.</th><th>IVA %</th><th>Total</th><th></th>
          </tr>
        </thead>
        <tbody id="itemsBody">${itemRowTemplate()}</tbody>
      </table>
      <div class="table-actions">
        <button type="button" class="btn-small" id="addItemBtn">+ Agregar ítem</button>
      </div>
      <div class="totals-box"><div class="totals-inner">
        <div class="total-row"><span>Subtotal</span><strong id="subtotal">$ 0</strong></div>
        <div class="total-row"><span>Descuento</span><strong id="descuento">$ 0</strong></div>
        <div class="total-row"><span>IVA</span><strong id="ivaTotal">$ 0</strong></div>
        <div class="total-row"><span>Total</span><strong id="granTotal">$ 0</strong></div>
      </div></div>
    </div>
  `;
}

function itemRowTemplate() {
  return `
    <tr class="item-row">
      <td><button type="button" class="btn-small search-item-btn">Buscar</button></td>
      <td><input data-item="codigo" placeholder="Código"></td>
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

function asientoSugeridoTemplate(tipo) {
  const labels = {
    venta: ["Débito", "Crédito ingreso", "Crédito IVA"],
    compra: ["Débito compra/gasto", "Débito IVA descontable", "Crédito proveedor/caja"],
    egreso: ["Débito obligación/gasto", "Crédito caja/banco", "Cuenta retenciones"],
    recibo: ["Débito caja/banco", "Crédito cliente/ingreso", "Cuenta retenciones"]
  }[tipo] || ["Cuenta débito", "Cuenta crédito", "Tercera cuenta"];

  return `
    <div class="form-block">
      <h4>Asiento contable sugerido</h4>
      <div class="grid grid-3">
        <label>${labels[0]} <input data-field="cuenta1"></label>
        <label>${labels[1]} <input data-field="cuenta2"></label>
        <label>${labels[2]} <input data-field="cuenta3"></label>
      </div>
    </div>
  `;
}

function observacionesTemplate(title = "Observaciones") {
  return `<div class="form-block"><h4>${title}</h4><textarea data-field="observaciones"></textarea></div>`;
}

/* Dynamic form */
$("tipoComprobante").addEventListener("change", renderDynamicForm);
$("buscarTerceroBtn").addEventListener("click", () => openSearchModal("tercero"));
$("guardarComprobanteBtn").addEventListener("click", saveComprobante);
$("limpiarComprobanteBtn").addEventListener("click", clearComprobante);

function renderDynamicForm() {
  const tipo = $("tipoComprobante").value;
  if (!tipo) {
    $("dynamicForm").className = "card empty-state";
    $("dynamicForm").innerHTML = `<h3>Selecciona un tipo de comprobante</h3><p>Cuando selecciones una opción, aparecerán los campos del documento.</p>`;
    return;
  }
  $("dynamicForm").className = "card";
  $("dynamicForm").innerHTML = templates[tipo];
  bindDynamicEvents();
  calculateAll();
}

function bindDynamicEvents() {
  const addBtn = $("addItemBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      $("itemsBody").insertAdjacentHTML("beforeend", itemRowTemplate());
      bindDynamicEvents();
      calculateAll();
    };
  }

  document.querySelectorAll("#dynamicForm input, #dynamicForm select, #dynamicForm textarea").forEach(el => {
    el.oninput = calculateAll;
    el.onchange = calculateAll;
  });

  document.querySelectorAll(".remove-row").forEach(btn => {
    btn.onclick = (e) => {
      if (document.querySelectorAll(".item-row").length <= 1) return alert("Debe quedar mínimo un ítem.");
      e.target.closest("tr").remove();
      calculateAll();
    };
  });

  document.querySelectorAll(".search-item-btn").forEach(btn => {
    btn.onclick = (e) => {
      state.activeItemRow = e.target.closest("tr");
      openSearchModal("item");
    };
  });
}

function calculateAll() {
  calculateItems();
  calculateEgreso();
}

function calculateItems() {
  let subtotal = 0, descuentoTotal = 0, ivaTotal = 0, total = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    const cantidad = Number(row.querySelector('[data-item="cantidad"]')?.value || 0);
    const valorUnitario = Number(row.querySelector('[data-item="valorUnitario"]')?.value || 0);
    const descuento = Number(row.querySelector('[data-item="descuento"]')?.value || 0);
    const iva = Number(row.querySelector('[data-item="iva"]')?.value || 0);
    const base = cantidad * valorUnitario;
    const baseConDesc = Math.max(base - descuento, 0);
    const ivaLinea = baseConDesc * iva / 100;
    const totalLinea = baseConDesc + ivaLinea;
    subtotal += base;
    descuentoTotal += descuento;
    ivaTotal += ivaLinea;
    total += totalLinea;
    const cell = row.querySelector(".line-total");
    if (cell) cell.textContent = money(totalLinea);
  });
  setText("subtotal", money(subtotal));
  setText("descuento", money(descuentoTotal));
  setText("ivaTotal", money(ivaTotal));
  setText("granTotal", money(total));
}

function calculateEgreso() {
  const bruto = Number(document.querySelector('[data-field="valorBruto"]')?.value || 0);
  const rf = Number(document.querySelector('[data-field="reteFuente"]')?.value || 0);
  const ri = Number(document.querySelector('[data-field="reteIva"]')?.value || 0);
  const od = Number(document.querySelector('[data-field="otrasDeducciones"]')?.value || 0);
  setText("netoEgreso", money(bruto - rf - ri - od));
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

/* Search modal */
$("closeModalBtn").onclick = closeModal;
$("modalSearchInput").addEventListener("input", renderModalResults);

function openSearchModal(mode) {
  state.modalMode = mode;
  $("searchModal").classList.remove("hidden");
  $("modalSearchInput").value = "";
  if (mode === "tercero") {
    $("modalTitle").textContent = "Buscar tercero";
    $("modalSubtitle").textContent = "Filtra por nombre, NIT, tipo, ciudad o correo.";
    $("modalSearchInput").placeholder = "Ej: cliente, proveedor, 900..., Pasto";
  } else {
    $("modalTitle").textContent = "Buscar producto o servicio";
    $("modalSubtitle").textContent = "Filtra por código, descripción, tipo o categoría.";
    $("modalSearchInput").placeholder = "Ej: servicio, IVA 19, P001...";
  }
  renderModalResults();
  setTimeout(() => $("modalSearchInput").focus(), 100);
}

function closeModal() {
  $("searchModal").classList.add("hidden");
  state.modalMode = null;
  state.activeItemRow = null;
}

function renderModalResults() {
  const q = normalize($("modalSearchInput").value);
  const data = state.modalMode === "tercero" ? state.terceros : state.inventario;
  const filtered = data.filter(item => normalize(JSON.stringify(item)).includes(q)).slice(0, 80);

  if (!filtered.length) {
    $("modalResults").innerHTML = `<div class="result-item"><strong>No hay resultados</strong><span>Registra primero la información o intenta otra búsqueda.</span></div>`;
    return;
  }

  $("modalResults").innerHTML = filtered.map(item => {
    if (state.modalMode === "tercero") {
      return `<div class="result-item" data-id="${item.id}">
        <strong>${escapeHtml(item.nombre)}</strong>
        <span>${escapeHtml(item.tipo)} · ${escapeHtml(item.tipoId)} ${escapeHtml(item.numeroId)} · ${escapeHtml(item.ciudad || "")} · ${escapeHtml(item.correo || "")}</span>
      </div>`;
    }
    return `<div class="result-item" data-id="${item.id}">
      <strong>${escapeHtml(item.codigo)} - ${escapeHtml(item.nombre)}</strong>
      <span>${escapeHtml(item.tipo)} · ${escapeHtml(item.categoria || "")} · Precio: ${money(item.precio)} · IVA: ${item.iva}% · Stock: ${item.stock}</span>
    </div>`;
  }).join("");

  document.querySelectorAll(".result-item[data-id]").forEach(el => {
    el.onclick = () => {
      if (state.modalMode === "tercero") selectTercero(el.dataset.id);
      if (state.modalMode === "item") selectItem(el.dataset.id);
      closeModal();
    };
  });
}

function selectTercero(id) {
  state.selectedTerceroId = id;
  const t = state.terceros.find(x => x.id === id);
  if (!t) return;
  $("terceroSeleccionadoTexto").textContent = t.nombre;
  $("terceroSeleccionadoDetalle").textContent = `${t.tipo} · ${t.tipoId} ${t.numeroId}${t.dv ? "-" + t.dv : ""} · ${t.responsabilidad}`;
}

function selectItem(id) {
  const item = state.inventario.find(x => x.id === id);
  const row = state.activeItemRow;
  if (!item || !row) return;

  row.dataset.itemId = item.id;
  row.querySelector('[data-item="codigo"]').value = item.codigo;
  row.querySelector('[data-item="descripcion"]').value = item.nombre;
  row.querySelector('[data-item="unidad"]').value = item.unidad;
  row.querySelector('[data-item="valorUnitario"]').value = item.precio;
  row.querySelector('[data-item="iva"]').value = item.iva;
  calculateAll();
}

/* Terceros */
$("guardarTerceroBtn").onclick = () => {
  const tercero = {
    id: uid(),
    tipo: val("terTipo"),
    tipoId: val("terTipoId"),
    numeroId: val("terNumeroId"),
    dv: val("terDv"),
    nombre: val("terNombre"),
    responsabilidad: val("terResponsabilidad"),
    ciudad: val("terCiudad"),
    direccion: val("terDireccion"),
    telefono: val("terTelefono"),
    correo: val("terCorreo"),
    cuenta: val("terCuenta"),
    estado: val("terEstado")
  };
  if (!tercero.numeroId || !tercero.nombre) return alert("El tercero necesita identificación y nombre.");
  state.terceros.push(tercero);
  save();
  clearTercero();
  renderAll();
  alert("Tercero guardado.");
};
$("limpiarTerceroBtn").onclick = clearTercero;
$("tercerosSearch").oninput = renderTerceros;

function clearTercero() {
  ["terNumeroId","terDv","terNombre","terCiudad","terDireccion","terTelefono","terCorreo","terCuenta"].forEach(id => $(id).value = "");
}

/* Inventario */
$("guardarItemBtn").onclick = () => {
  const item = {
    id: uid(),
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
    cuentaCosto: val("itemCuentaCosto")
  };
  if (!item.codigo || !item.nombre) return alert("El producto/servicio necesita código y nombre.");
  state.inventario.push(item);
  save();
  clearItem();
  renderAll();
  alert("Ítem guardado.");
};
$("limpiarItemBtn").onclick = clearItem;
$("inventarioSearch").oninput = renderInventario;

function clearItem() {
  ["itemCodigo","itemNombre","itemCategoria","itemCuentaIngreso","itemCuentaCosto"].forEach(id => $(id).value = "");
  ["itemCosto","itemPrecio","itemIva","itemStock","itemStockMinimo"].forEach(id => $(id).value = "0");
}

/* Save comprobante + integrated accounting */
function saveComprobante() {
  const tipo = $("tipoComprobante").value;
  const tercero = state.terceros.find(t => t.id === state.selectedTerceroId);
  if (!tipo) return alert("Selecciona un tipo de comprobante.");
  if (!tercero) return alert("Busca y selecciona un tercero.");

  const comprobante = collectComprobante(tipo, tercero);
  if (!comprobante.consecutivo) return alert("Escribe un consecutivo.");

  applyAccountingEffects(comprobante);

  state.comprobantes.push(comprobante);
  save();
  renderAll();
  alert("Comprobante guardado con efectos contables básicos.");
}

function collectComprobante(tipo, tercero) {
  const campos = {};
  document.querySelectorAll("#dynamicForm [data-field]").forEach(el => campos[el.dataset.field] = el.value);

  const items = [...document.querySelectorAll(".item-row")].map(row => {
    const item = {};
    row.querySelectorAll("[data-item]").forEach(el => item[el.dataset.item] = el.value);
    item.itemId = row.dataset.itemId || null;
    item.cantidad = Number(item.cantidad || 0);
    item.valorUnitario = Number(item.valorUnitario || 0);
    item.descuento = Number(item.descuento || 0);
    item.iva = Number(item.iva || 0);
    const base = Math.max(item.cantidad * item.valorUnitario - item.descuento, 0);
    item.ivaValor = base * item.iva / 100;
    item.total = base + item.ivaValor;
    return item;
  }).filter(i => i.descripcion || i.codigo);

  const totalItems = items.reduce((acc, i) => acc + i.total, 0);
  const egresoNeto = Number(campos.valorBruto || 0) - Number(campos.reteFuente || 0) - Number(campos.reteIva || 0) - Number(campos.otrasDeducciones || 0);
  const reciboNeto = Number(campos.valorNeto || 0);
  const cuentaSaldo = Number(campos.saldo || 0);

  let total = totalItems;
  if (tipo === "comprobante_egreso") total = egresoNeto;
  if (tipo === "recibo_caja") total = reciboNeto || Number(campos.valorRecibido || 0);
  if (tipo === "cuenta_pagar") total = cuentaSaldo || Number(campos.valorBase || 0) + Number(campos.iva || 0) - Number(campos.retenciones || 0);

  return {
    id: uid(),
    tipo,
    consecutivo: $("consecutivo").value.trim(),
    fecha: $("fecha").value,
    estado: $("estadoComprobante").value,
    tercero,
    campos,
    items,
    total,
    createdAt: new Date().toISOString()
  };
}

function applyAccountingEffects(c) {
  const doc = `${labelTipo(c.tipo)} ${c.consecutivo}`;
  const total = Number(c.total || 0);
  const forma = c.campos.formaPago || "";
  const subtotal = c.items.reduce((a, i) => a + Math.max(i.cantidad * i.valorUnitario - i.descuento, 0), 0);
  const iva = c.items.reduce((a, i) => a + i.ivaValor, 0);

  if (c.tipo === "factura_venta") {
    if (forma === "Crédito") createCxc(c, total);
    addAsiento(c, doc, forma === "Crédito" ? "1305 Clientes" : "1105 Caja/Banco", total, 0);
    addAsiento(c, doc, "4135 Ingresos operacionales", 0, subtotal);
    if (iva) addAsiento(c, doc, "2408 IVA generado", 0, iva);
    moveInventory(c, "salida");
  }

  if (c.tipo === "factura_compra") {
    if (forma === "Crédito") createCxp(c, total);
    addAsiento(c, doc, "1435 Inventario / 5135 Gasto", subtotal, 0);
    if (iva) addAsiento(c, doc, "2408 IVA descontable", iva, 0);
    addAsiento(c, doc, forma === "Crédito" ? "2205 Proveedores" : "1105 Caja/Banco", 0, total);
    moveInventory(c, "entrada");
  }

  if (c.tipo === "cuenta_pagar") {
    createCxp(c, total);
    addAsiento(c, doc, c.campos.cuenta || "5135 Gasto / obligación", total, 0);
    addAsiento(c, doc, "2205 Proveedores / acreedores", 0, total);
  }

  if (c.tipo === "comprobante_egreso") {
    addAsiento(c, doc, c.campos.cuenta1 || "2205 Proveedores / gasto", total, 0);
    addAsiento(c, doc, c.campos.cuenta2 || "1105 Caja/Banco", 0, total);
  }

  if (c.tipo === "recibo_caja") {
    addAsiento(c, doc, c.campos.cuenta1 || "1105 Caja/Banco", total, 0);
    addAsiento(c, doc, c.campos.cuenta2 || "1305 Clientes / ingresos", 0, total);
  }
}

function createCxc(c, total) {
  state.cxc.push({ id: uid(), fecha: c.fecha, tercero: c.tercero, documento: c.consecutivo, comprobanteId: c.id, saldo: total, estado: "Pendiente" });
}
function createCxp(c, total) {
  state.cxp.push({ id: uid(), fecha: c.fecha, tercero: c.tercero, documento: c.consecutivo, comprobanteId: c.id, saldo: total, estado: "Pendiente" });
}
function addAsiento(c, doc, cuenta, debito, credito) {
  state.asientos.push({ id: uid(), fecha: c.fecha, documento: doc, cuenta, debito, credito, comprobanteId: c.id });
}
function moveInventory(c, direction) {
  c.items.forEach(i => {
    if (!i.itemId) return;
    const inv = state.inventario.find(x => x.id === i.itemId);
    if (!inv || inv.tipo !== "Producto") return;
    const cantidad = Number(i.cantidad || 0);
    if (direction === "salida") inv.stock = Number(inv.stock || 0) - cantidad;
    if (direction === "entrada") inv.stock = Number(inv.stock || 0) + cantidad;
    state.kardex.push({
      id: uid(),
      fecha: c.fecha,
      item: `${inv.codigo} - ${inv.nombre}`,
      entrada: direction === "entrada" ? cantidad : 0,
      salida: direction === "salida" ? cantidad : 0,
      documento: `${labelTipo(c.tipo)} ${c.consecutivo}`,
      comprobanteId: c.id
    });
  });
}

function clearComprobante() {
  $("tipoComprobante").value = "";
  $("consecutivo").value = "";
  $("estadoComprobante").value = "Borrador";
  $("fecha").valueAsDate = new Date();
  state.selectedTerceroId = null;
  $("terceroSeleccionadoTexto").textContent = "Ninguno";
  $("terceroSeleccionadoDetalle").textContent = "Busca por nombre, NIT, ciudad, correo o tipo.";
  renderDynamicForm();
}

/* Print */
function printComprobante(id) {
  const c = state.comprobantes.find(x => x.id === id);
  if (!c) return alert("No se encontró el comprobante.");
  const html = buildPrintHtml(c);
  const w = window.open("", "_blank", "width=900,height=1000");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function buildPrintHtml(c) {
  const isItemsDoc = ["factura_venta", "factura_compra"].includes(c.tipo);
  const title = labelTipo(c.tipo).toUpperCase();
  const itemsRows = c.items.map(i => `
    <tr>
      <td>${escapeHtml(i.codigo || "")}</td>
      <td>${escapeHtml(i.descripcion || "")}</td>
      <td class="right">${i.cantidad || 0}</td>
      <td>${escapeHtml(i.unidad || "")}</td>
      <td class="right">${money(i.valorUnitario)}</td>
      <td class="right">${money(i.descuento)}</td>
      <td class="right">${i.iva || 0}%</td>
      <td class="right">${money(i.total)}</td>
    </tr>
  `).join("");

  const infoRows = Object.entries(c.campos || {}).filter(([k,v]) => v).map(([k,v]) => `
    <tr><td><strong>${fieldLabel(k)}</strong></td><td>${escapeHtml(v)}</td></tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title} ${escapeHtml(c.consecutivo)}</title>
<style>
  body { font-family: Arial, sans-serif; color: #222; margin: 30px; }
  .header { display:flex; justify-content:space-between; border-bottom:3px solid #174a76; padding-bottom:18px; margin-bottom:22px; }
  .brand h1 { margin:0; color:#174a76; font-size:26px; }
  .brand p { margin:4px 0; color:#555; }
  .doc-title { text-align:right; }
  .doc-title h2 { margin:0; color:#174a76; }
  .box { border:1px solid #ddd; border-radius:10px; padding:14px; margin-bottom:16px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th { background:#eef4f8; color:#174a76; text-align:left; }
  th, td { border:1px solid #ddd; padding:8px; font-size:13px; }
  .right { text-align:right; }
  .totals { width:330px; margin-left:auto; }
  .totals td:last-child { text-align:right; font-weight:bold; }
  .signatures { display:grid; grid-template-columns:1fr 1fr 1fr; gap:30px; margin-top:50px; }
  .sig { border-top:1px solid #444; padding-top:8px; text-align:center; font-size:13px; }
  @media print { button { display:none; } body { margin:18px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>FINANZAS JL</h1>
      <p>Sistema contable</p>
      <p>Documento generado desde la app</p>
    </div>
    <div class="doc-title">
      <h2>${title}</h2>
      <p><strong>No.</strong> ${escapeHtml(c.consecutivo)}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(c.fecha)}</p>
      <p><strong>Estado:</strong> ${escapeHtml(c.estado)}</p>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h3>Tercero</h3>
      <p><strong>${escapeHtml(c.tercero.nombre)}</strong></p>
      <p>${escapeHtml(c.tercero.tipoId)}: ${escapeHtml(c.tercero.numeroId)}${c.tercero.dv ? "-" + escapeHtml(c.tercero.dv) : ""}</p>
      <p>${escapeHtml(c.tercero.direccion || "")} ${escapeHtml(c.tercero.ciudad || "")}</p>
      <p>${escapeHtml(c.tercero.correo || "")} ${escapeHtml(c.tercero.telefono || "")}</p>
    </div>
    <div class="box">
      <h3>Datos del documento</h3>
      <table>${infoRows || "<tr><td>Sin datos adicionales</td></tr>"}</table>
    </div>
  </div>

  ${isItemsDoc ? `
  <div class="box">
    <h3>Detalle</h3>
    <table>
      <thead><tr><th>Código</th><th>Descripción</th><th>Cant.</th><th>Und</th><th>Vr. Unitario</th><th>Desc.</th><th>IVA</th><th>Total</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>` : ""}

  <table class="totals">
    <tr><td>Total documento</td><td>${money(c.total)}</td></tr>
  </table>

  ${c.campos.observaciones ? `<div class="box"><h3>Observaciones</h3><p>${escapeHtml(c.campos.observaciones)}</p></div>` : ""}

  <div class="signatures">
    <div class="sig">Elaboró</div>
    <div class="sig">Revisó / aprobó</div>
    <div class="sig">Recibí conforme</div>
  </div>
</body>
</html>`;
}

/* Render */
function renderAll() {
  renderTerceros();
  renderInventario();
  renderHistorial();
  renderRecent();
  renderCartera();
  renderReportes();
  renderMetrics();
}

function renderTerceros() {
  const q = normalize($("tercerosSearch")?.value || "");
  const rows = state.terceros.filter(t => normalize(JSON.stringify(t)).includes(q));
  $("tercerosTable").innerHTML = rows.map(t => `
    <tr><td>${t.tipo}</td><td>${t.tipoId} ${t.numeroId}${t.dv ? "-" + t.dv : ""}</td><td>${t.nombre}</td><td>${t.responsabilidad}</td><td>${t.ciudad}</td><td>${t.correo}</td></tr>
  `).join("") || `<tr><td colspan="6">No hay terceros.</td></tr>`;
}

function renderInventario() {
  const q = normalize($("inventarioSearch")?.value || "");
  const rows = state.inventario.filter(i => normalize(JSON.stringify(i)).includes(q));
  $("inventarioTable").innerHTML = rows.map(i => `
    <tr><td>${i.tipo}</td><td>${i.codigo}</td><td>${i.nombre}</td><td>${i.unidad}</td><td>${money(i.costo)}</td><td>${money(i.precio)}</td><td>${i.iva}%</td><td>${i.stock}</td></tr>
  `).join("") || `<tr><td colspan="8">No hay inventario.</td></tr>`;
}

$("historialSearch").oninput = renderHistorial;

function renderHistorial() {
  const q = normalize($("historialSearch")?.value || "");
  const rows = state.comprobantes.filter(c => normalize(`${labelTipo(c.tipo)} ${c.consecutivo} ${c.tercero?.nombre} ${c.total}`).includes(q));
  $("historialTable").innerHTML = rows.map(c => rowComprobante(c)).join("") || `<tr><td colspan="7">No hay comprobantes.</td></tr>`;
}

function renderRecent() {
  const rows = [...state.comprobantes].slice(-5).reverse();
  $("recentTable").innerHTML = rows.map(c => `
    <tr><td>${c.fecha}</td><td>${labelTipo(c.tipo)}</td><td>${c.consecutivo}</td><td>${c.tercero?.nombre || ""}</td><td>${money(c.total)}</td><td><button class="btn-print" onclick="printComprobante('${c.id}')">Imprimir</button></td></tr>
  `).join("") || `<tr><td colspan="6">No hay comprobantes.</td></tr>`;
}

function rowComprobante(c) {
  return `<tr>
    <td>${c.fecha}</td>
    <td>${labelTipo(c.tipo)}</td>
    <td>${c.consecutivo}</td>
    <td>${c.tercero?.nombre || ""}</td>
    <td>${money(c.total)}</td>
    <td>${efectoLabel(c)}</td>
    <td><button class="btn-print" onclick="printComprobante('${c.id}')">Imprimir</button></td>
  </tr>`;
}

function renderCartera() {
  $("cxcTable").innerHTML = state.cxc.map(x => `<tr><td>${x.fecha}</td><td>${x.tercero?.nombre}</td><td>${x.documento}</td><td>${money(x.saldo)}</td><td>${x.estado}</td></tr>`).join("") || `<tr><td colspan="5">No hay CxC.</td></tr>`;
  $("cxpTable").innerHTML = state.cxp.map(x => `<tr><td>${x.fecha}</td><td>${x.tercero?.nombre}</td><td>${x.documento}</td><td>${money(x.saldo)}</td><td>${x.estado}</td></tr>`).join("") || `<tr><td colspan="5">No hay CxP.</td></tr>`;
}

function renderReportes() {
  $("asientosTable").innerHTML = state.asientos.map(a => `<tr><td>${a.fecha}</td><td>${a.documento}</td><td>${a.cuenta}</td><td>${money(a.debito)}</td><td>${money(a.credito)}</td></tr>`).join("") || `<tr><td colspan="5">No hay asientos.</td></tr>`;
  $("kardexTable").innerHTML = state.kardex.map(k => `<tr><td>${k.fecha}</td><td>${k.item}</td><td>${k.entrada}</td><td>${k.salida}</td><td>${k.documento}</td></tr>`).join("") || `<tr><td colspan="5">No hay kardex.</td></tr>`;
}

function renderMetrics() {
  const ingresos = state.comprobantes.filter(c => ["factura_venta","recibo_caja"].includes(c.tipo)).reduce((a,c) => a + Number(c.total || 0), 0);
  const egresos = state.comprobantes.filter(c => ["factura_compra","comprobante_egreso","cuenta_pagar"].includes(c.tipo)).reduce((a,c) => a + Number(c.total || 0), 0);
  const cxc = state.cxc.reduce((a,x) => a + Number(x.saldo || 0), 0);
  const cxp = state.cxp.reduce((a,x) => a + Number(x.saldo || 0), 0);
  $("metricIngresos").textContent = money(ingresos);
  $("metricEgresos").textContent = money(egresos);
  $("metricCxc").textContent = money(cxc);
  $("metricCxp").textContent = money(cxp);
}

/* Demo + reset */
$("demoBtn").onclick = () => {
  if (!confirm("Esto cargará terceros e inventario de ejemplo. ¿Continuar?")) return;
  if (!state.terceros.length) {
    state.terceros.push(
      { id: uid(), tipo:"Cliente", tipoId:"NIT", numeroId:"900123456", dv:"1", nombre:"Comercial Pasto S.A.S", responsabilidad:"Responsable de IVA", ciudad:"Pasto", direccion:"Centro", telefono:"3000000000", correo:"cliente@demo.com", cuenta:"1305", estado:"Activo" },
      { id: uid(), tipo:"Proveedor", tipoId:"NIT", numeroId:"901777888", dv:"2", nombre:"Proveedor Andino S.A.S", responsabilidad:"Responsable de IVA", ciudad:"Pasto", direccion:"Nariño", telefono:"3010000000", correo:"proveedor@demo.com", cuenta:"2205", estado:"Activo" }
    );
  }
  if (!state.inventario.length) {
    state.inventario.push(
      { id: uid(), tipo:"Servicio", codigo:"S001", nombre:"Asesoría contable mensual", unidad:"Servicio", categoria:"Servicios contables", costo:0, precio:250000, iva:19, stock:0, stockMinimo:0, cuentaIngreso:"4135", cuentaCosto:"5135" },
      { id: uid(), tipo:"Producto", codigo:"P001", nombre:"Papelería contable", unidad:"Und", categoria:"Insumos", costo:12000, precio:25000, iva:19, stock:50, stockMinimo:5, cuentaIngreso:"4135", cuentaCosto:"6135" }
    );
  }
  save();
  renderAll();
  alert("Datos demo cargados.");
};

$("resetBtn").onclick = () => {
  if (!confirm("Esto borrará todos los datos locales de esta versión. ¿Continuar?")) return;
  ["fjl_terceros","fjl_inventario","fjl_comprobantes","fjl_asientos","fjl_cxc","fjl_cxp","fjl_kardex"].forEach(k => localStorage.removeItem(k));
  location.reload();
};

/* Helpers */
function save() {
  localStorage.setItem("fjl_terceros", JSON.stringify(state.terceros));
  localStorage.setItem("fjl_inventario", JSON.stringify(state.inventario));
  localStorage.setItem("fjl_comprobantes", JSON.stringify(state.comprobantes));
  localStorage.setItem("fjl_asientos", JSON.stringify(state.asientos));
  localStorage.setItem("fjl_cxc", JSON.stringify(state.cxc));
  localStorage.setItem("fjl_cxp", JSON.stringify(state.cxp));
  localStorage.setItem("fjl_kardex", JSON.stringify(state.kardex));
}

function val(id) { return $(id).value.trim(); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }
function money(v) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v || 0)); }
function normalize(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function labelTipo(tipo) {
  return {
    factura_venta:"Factura de venta",
    factura_compra:"Factura de compra",
    cuenta_pagar:"Cuenta por pagar",
    comprobante_egreso:"Comprobante de egreso",
    recibo_caja:"Recibo de caja"
  }[tipo] || tipo;
}
function efectoLabel(c) {
  return {
    factura_venta:"Ingreso / CxC si crédito / salida inventario",
    factura_compra:"Compra / CxP si crédito / entrada inventario",
    cuenta_pagar:"Genera CxP",
    comprobante_egreso:"Salida caja/banco",
    recibo_caja:"Entrada caja/banco"
  }[c.tipo] || "";
}
function fieldLabel(k) {
  const map = {
    formaPago:"Forma de pago", medioPago:"Medio de pago", plazoDias:"Plazo días", fechaVencimiento:"Fecha vencimiento",
    observaciones:"Observaciones", facturaProveedor:"Factura proveedor", cufe:"CUFE", centroCosto:"Centro de costo",
    concepto:"Concepto", documentoRelacionado:"Documento relacionado", fechaPago:"Fecha de pago", bancoCaja:"Banco / caja",
    referenciaPago:"Referencia pago", valorBruto:"Valor bruto", reteFuente:"Retención en la fuente", reteIva:"Retención IVA",
    otrasDeducciones:"Otras deducciones", valorRecibido:"Valor recibido", retenciones:"Retenciones", valorNeto:"Valor neto"
  };
  return map[k] || k;
}

window.printComprobante = printComprobante;

renderDynamicForm();
renderAll();
