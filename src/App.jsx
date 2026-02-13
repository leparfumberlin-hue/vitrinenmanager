import { useState, useEffect, useCallback } from "react"
import { supabase } from "./supabaseClient"
import {
  LogIn, LogOut, LayoutDashboard, Package, Users, ShoppingCart,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Menu, X,
  Plus, Minus, Save, RefreshCw, MapPin,
  Boxes, Pencil, Trash2
} from "lucide-react"

// ─── Color Tokens ────────────────────────────────────────────
const k = {
  primary: "#064e3b", primaryDark: "#022c22",
  em50: "#ecfdf5", em100: "#d1fae5", em500: "#10b981", em600: "#059669",
  w: "#fff",
  g50: "#f9fafb", g100: "#f3f4f6", g200: "#e5e7eb", g300: "#d1d5db",
  g400: "#9ca3af", g500: "#6b7280", g600: "#4b5563", g700: "#374151", g900: "#111827",
  r100: "#fee2e2", r500: "#ef4444",
  y100: "#fef3c7", y500: "#f59e0b",
  gr100: "#dcfce7", gr500: "#22c55e",
}

// ─── Shared Components ───────────────────────────────────────
function AmpelBadge({ ampel }) {
  const cfg = {
    "grün": { bg: k.gr100, color: "#166534", icon: CheckCircle, label: "OK" },
    gelb: { bg: k.y100, color: "#92400e", icon: AlertTriangle, label: "Niedrig" },
    rot: { bg: k.r100, color: "#991b1b", icon: XCircle, label: "Kritisch" },
  }
  const s = cfg[ampel] || cfg.rot
  const Icon = s.icon
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: s.bg, color: s.color }}>
      <Icon size={14} /> {s.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: k.w, borderRadius: 16, padding: "24px 28px",
        boxShadow: h ? "0 8px 25px rgba(6,78,59,0.1)" : "0 1px 3px rgba(0,0,0,0.06)",
        border: `1px solid ${k.g200}`, display: "flex", alignItems: "center", gap: 16,
        transition: "transform 0.2s, box-shadow 0.2s", transform: h ? "translateY(-2px)" : "none",
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: accent || k.em50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={k.primary} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: k.g500, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: k.g900, letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </div>
  )
}

function DataTable({ columns, data }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${k.g200}`, background: k.w }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: k.g50 }}>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: k.g600, borderBottom: `2px solid ${k.g200}`, whiteSpace: "nowrap", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: k.g400 }}>Keine Daten vorhanden</td></tr>
          ) : data.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${k.g100}` }}>
              {columns.map((col, ci) => (
                <td key={ci} style={{ padding: "12px 16px", color: k.g700 }}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div style={{ background: k.w, borderRadius: 20, padding: 32, maxWidth: 520, width: "90%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: k.g900 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={k.g400} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: k.g600, marginBottom: 6 }}>{label}</label>
      <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${k.g300}`, fontSize: 14, outline: "none", boxSizing: "border-box", ...(props.style || {}) }} />
    </div>
  )
}

function Btn({ children, variant = "primary", onClick, disabled, style: extra }) {
  const styles = { primary: { background: k.primary, color: k.w, border: "none" }, secondary: { background: k.g100, color: k.g700, border: `1px solid ${k.g200}` }, danger: { background: k.r500, color: k.w, border: "none" } }
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: disabled ? 0.6 : 1, ...styles[variant], ...(extra || {}) }}>
      {children}
    </button>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80 }}>
      <RefreshCw size={32} color={k.primary} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorMsg({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <XCircle size={48} color={k.r500} style={{ marginBottom: 16 }} />
      <p style={{ color: k.g700, fontSize: 16, marginBottom: 16 }}>{message}</p>
      {onRetry && <Btn onClick={onRetry}><RefreshCw size={16} /> Erneut versuchen</Btn>}
    </div>
  )
}

function PageHeader({ title, subtitle, action, setMobileOpen }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setMobileOpen?.(true)} className="mobile-menu-btn" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Menu size={24} color={k.g600} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: k.g900, letterSpacing: "-0.02em" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: k.g500, marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// ─── LOGIN PAGE ──────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true); setError("")
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      const { data: appUser, error: userErr } = await supabase.from("app_users").select("*").eq("user_id", data.user.id).single()
      if (userErr) throw new Error("Benutzer nicht in app_users gefunden. Bitte Admin kontaktieren.")
      onLogin({ ...data.user, appUser })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${k.primaryDark} 0%, ${k.primary} 50%, ${k.em600} 100%)` }}>
      <div style={{ background: k.w, borderRadius: 24, padding: 48, width: 400, maxWidth: "92%", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: k.em50, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Boxes size={32} color={k.primary} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: k.g900, marginBottom: 4 }}>Vitrinenmanager</h1>
          <p style={{ color: k.g500, fontSize: 14 }}>Bitte melde dich an</p>
        </div>
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: k.r100, color: "#991b1b", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <XCircle size={16} /> {error}
          </div>
        )}
        <InputField label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de" />
        <InputField label="Passwort" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        <Btn onClick={handleLogin} disabled={loading || !email || !password} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
          <LogIn size={18} /> {loading ? "Anmelden..." : "Anmelden"}
        </Btn>
      </div>
    </div>
  )
}

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ role, activePage, setActivePage, onLogout, userEmail, mobileOpen, setMobileOpen }) {
  const sellerNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sales", label: "Verkauf erfassen", icon: ShoppingCart },
  ]
  const adminNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vitrines", label: "Vitrinen", icon: MapPin },
    { id: "stock", label: "Bestand", icon: Boxes },
    { id: "sales", label: "Verkäufe", icon: ShoppingCart },
    { id: "refill", label: "Nachfüllbedarf", icon: AlertTriangle },
    { id: "products", label: "Produkte", icon: Package },
    { id: "users", label: "Nutzer", icon: Users },
  ]
  const nav = role === "admin" ? adminNav : sellerNav

  const content = (
    <div style={{ width: 250, height: "100vh", background: k.primaryDark, display: "flex", flexDirection: "column", color: k.w, flexShrink: 0 }}>
      <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Vitrinenmanager</div>
            <div style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{role === "admin" ? "Admin" : "Verkäufer"}</div>
          </div>
          {mobileOpen && <button onClick={() => setMobileOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: k.w }}><X size={20} /></button>}
        </div>
      </div>
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {nav.map(item => {
          const active = activePage === item.id
          return (
            <button key={item.id} onClick={() => { setActivePage(item.id); setMobileOpen(false) }}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, background: active ? "rgba(255,255,255,0.15)" : "transparent", color: active ? k.w : "rgba(255,255,255,0.65)", width: "100%", textAlign: "left" }}>
              <item.icon size={18} /> {item.label}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ padding: "6px 14px", marginBottom: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{userEmail}</div>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, background: "transparent", color: "rgba(255,255,255,0.65)", width: "100%", textAlign: "left" }}>
          <LogOut size={18} /> Abmelden
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="sidebar-desktop">{content}</div>
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: "relative", zIndex: 101 }}>{content}</div>
        </div>
      )}
    </>
  )
}

// ─── SELLER DASHBOARD ────────────────────────────────────────
function SellerDashboard({ appUser, setMobileOpen }) {
  const [trafficLight, setTrafficLight] = useState([])
  const [products, setProducts] = useState([])
  const [vitrine, setVitrine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const [tlRes, pRes, vRes] = await Promise.all([
        supabase.from("v_stock_traffic_light").select("*").eq("vitrine_id", appUser.vitrine_id),
        supabase.from("products").select("*"),
        supabase.from("vitrines").select("*").eq("vitrine_id", appUser.vitrine_id).single(),
      ])
      if (tlRes.error) throw tlRes.error
      setTrafficLight(tlRes.data || [])
      setProducts(pRes.data || [])
      setVitrine(vRes.data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [appUser.vitrine_id])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMsg message={error} onRetry={load} />

  const getName = pid => products.find(p => p.product_id === pid)?.name || pid
  const totalStock = trafficLight.reduce((s, t) => s + (t.stock_qty || 0), 0)
  const criticalCount = trafficLight.filter(t => t.ampel === "rot").length
  const warningCount = trafficLight.filter(t => t.ampel === "gelb").length

  return (
    <div>
      <PageHeader title={vitrine?.location_name || "Meine Vitrine"} subtitle={vitrine ? `${vitrine.city} · ${vitrine.vitrine_id}` : ""} setMobileOpen={setMobileOpen} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={Boxes} label="Gesamtbestand" value={totalStock} />
        <StatCard icon={AlertTriangle} label="Warnungen" value={warningCount} accent={k.y100} />
        <StatCard icon={XCircle} label="Kritisch" value={criticalCount} accent={k.r100} />
      </div>
      <div style={{ background: k.w, borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${k.g200}` }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: k.g900, marginBottom: 14 }}>Bestand & Nachfüllbedarf</h3>
        <DataTable columns={[
          { key: "product_id", label: "Produkt", render: r => getName(r.product_id) },
          { key: "stock_qty", label: "Bestand" },
          { key: "min_stock", label: "Min" },
          { key: "ampel", label: "Status", render: r => <AmpelBadge ampel={r.ampel} /> },
        ]} data={trafficLight} />
      </div>
    </div>
  )
}

// ─── SELLER SALES ────────────────────────────────────────────
function SellerSalesPage({ appUser, setMobileOpen }) {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [recentSales, setRecentSales] = useState([])

  const loadData = useCallback(async () => {
    const [pRes, sRes] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("sales").select("*").eq("vitrine_id", appUser.vitrine_id).order("sold_at", { ascending: false }).limit(10),
    ])
    setProducts(pRes.data || [])
    setRecentSales(sRes.data || [])
  }, [appUser.vitrine_id])

  useEffect(() => { loadData() }, [loadData])

  const handleSale = async () => {
    setLoading(true); setError(""); setSuccess("")
    try {
      const product = products.find(p => p.product_id === selectedProduct)
      if (!product) throw new Error("Produkt nicht gefunden")
      const { error: insertErr } = await supabase.from("sales").insert({
        vitrine_id: appUser.vitrine_id, product_id: selectedProduct, qty,
        price_per_item: product.standard_price || 0,
        revenue: (product.standard_price || 0) * qty, status: "confirmed"
      })
      if (insertErr) throw insertErr
      setSuccess(`${qty}× ${product.name} erfolgreich erfasst!`)
      setQty(1)
      loadData()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const getName = pid => products.find(p => p.product_id === pid)?.name || pid

  return (
    <div>
      <PageHeader title="Verkauf erfassen" subtitle="Neuen Verkauf eintragen" setMobileOpen={setMobileOpen} />
      <div style={{ background: k.w, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${k.g200}`, marginBottom: 20 }}>
        {success && <div style={{ padding: "12px 16px", borderRadius: 10, background: k.gr100, color: "#166534", fontSize: 14, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={16} /> {success}</div>}
        {error && <div style={{ padding: "12px 16px", borderRadius: 10, background: k.r100, color: "#991b1b", fontSize: 14, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><XCircle size={16} /> {error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: k.g600, marginBottom: 6 }}>Produkt</label>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${k.g300}`, fontSize: 14, background: k.w, boxSizing: "border-box" }}>
            <option value="">– Produkt wählen –</option>
            {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: k.g600, marginBottom: 6 }}>Menge</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${k.g300}`, background: k.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={18} /></button>
            <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 70, textAlign: "center", padding: 8, borderRadius: 10, border: `1px solid ${k.g300}`, fontSize: 18, fontWeight: 700 }} />
            <button onClick={() => setQty(q => q + 1)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${k.g300}`, background: k.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={18} /></button>
          </div>
        </div>
        <Btn onClick={handleSale} disabled={loading || !selectedProduct}><Save size={18} /> {loading ? "Speichere..." : "Verkauf speichern"}</Btn>
      </div>
      <div style={{ background: k.w, borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${k.g200}` }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: k.g900, marginBottom: 14 }}>Letzte Verkäufe</h3>
        <DataTable columns={[
          { key: "sold_at", label: "Datum", render: r => r.sold_at ? new Date(r.sold_at).toLocaleString("de-DE") : "–" },
          { key: "product_id", label: "Produkt", render: r => getName(r.product_id) },
          { key: "qty", label: "Menge" },
          { key: "revenue", label: "Umsatz", render: r => r.revenue ? `${Number(r.revenue).toFixed(2)} €` : "–" },
        ]} data={recentSales} />
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────
function AdminDashboard({ setMobileOpen }) {
  const [vitrines, setVitrines] = useState([])
  const [trafficLight, setTrafficLight] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    (async () => {
      const [vR, sR, tR, mR, pR] = await Promise.all([
        supabase.from("vitrines").select("*"),
        supabase.from("v_stock_current").select("*"),
        supabase.from("v_stock_traffic_light").select("*"),
        supabase.from("v_monthly_summary").select("*").order("billing_month", { ascending: false }).limit(20),
        supabase.from("products").select("*"),
      ])
      setVitrines(vR.data || []); setStock(sR.data || [])
      setTrafficLight(tR.data || []); setMonthlySummary(mR.data || [])
      setProducts(pR.data || []); setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingSpinner />

  const totalStock = stock.reduce((s, i) => s + (i.stock_qty || 0), 0)
  const activeVitrines = vitrines.filter(v => v.status === "active").length
  const criticalItems = trafficLight.filter(t => t.ampel === "rot").length
  const totalRevenue = monthlySummary.reduce((s, m) => s + Number(m.revenue_sum || 0), 0)
  const getName = pid => products.find(p => p.product_id === pid)?.name || pid
  const getVit = vid => vitrines.find(v => v.vitrine_id === vid)?.location_name || vid

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Überblick über alle Vitrinen" setMobileOpen={setMobileOpen} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={MapPin} label="Vitrinen (aktiv)" value={`${activeVitrines}/${vitrines.length}`} />
        <StatCard icon={Boxes} label="Gesamtbestand" value={totalStock} />
        <StatCard icon={XCircle} label="Kritisch" value={criticalItems} accent={k.r100} />
        <StatCard icon={TrendingUp} label="Umsatz (gesamt)" value={`${totalRevenue.toFixed(0)} €`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        <div style={{ background: k.w, borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${k.g200}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: k.g900, marginBottom: 14 }}>Vitrinen</h3>
          <DataTable columns={[
            { key: "location_name", label: "Standort" }, { key: "city", label: "Stadt" },
            { key: "status", label: "Status", render: r => <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: r.status === "active" ? k.gr100 : k.g100, color: r.status === "active" ? "#166534" : k.g500 }}>{r.status === "active" ? "Aktiv" : r.status}</span> },
          ]} data={vitrines} />
        </div>
        <div style={{ background: k.w, borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${k.g200}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: k.g900, marginBottom: 14 }}>Nachfüllbedarf</h3>
          <DataTable columns={[
            { key: "ampel", label: "Status", render: r => <AmpelBadge ampel={r.ampel} /> },
            { key: "vitrine_id", label: "Vitrine", render: r => getVit(r.vitrine_id) },
            { key: "product_id", label: "Produkt", render: r => getName(r.product_id) },
            { key: "stock_qty", label: "Bestand" },
          ]} data={trafficLight.filter(t => t.ampel !== "grün").sort((a, b) => (a.ampel === "rot" ? 0 : 1) - (b.ampel === "rot" ? 0 : 1))} />
        </div>
      </div>
    </div>
  )
}

// ─── ADMIN PAGES ─────────────────────────────────────────────
function AdminVitrinesPage({ setMobileOpen }) {
  const [vitrines, setVitrines] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from("vitrines").select("*").then(({ data }) => { setVitrines(data || []); setLoading(false) }) }, [])
  if (loading) return <LoadingSpinner />
  return (
    <div>
      <PageHeader title="Vitrinen" subtitle="Alle Standorte" setMobileOpen={setMobileOpen} />
      <DataTable columns={[
        { key: "vitrine_id", label: "ID" }, { key: "location_name", label: "Standort" }, { key: "city", label: "Stadt" },
        { key: "status", label: "Status", render: r => <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: r.status === "active" ? k.gr100 : k.g100, color: r.status === "active" ? "#166534" : k.g500 }}>{r.status === "active" ? "Aktiv" : r.status}</span> },
        { key: "notes", label: "Notizen", render: r => r.notes || "–" },
      ]} data={vitrines} />
    </div>
  )
}

function AdminStockPage({ setMobileOpen }) {
  const [stock, setStock] = useState([]); const [products, setProducts] = useState([]); const [vitrines, setVitrines] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([supabase.from("v_stock_current").select("*"), supabase.from("products").select("*"), supabase.from("vitrines").select("*")])
      .then(([s, p, v]) => { setStock(s.data || []); setProducts(p.data || []); setVitrines(v.data || []); setLoading(false) })
  }, [])
  if (loading) return <LoadingSpinner />
  return (
    <div>
      <PageHeader title="Bestand" subtitle="Aktueller Bestand aller Vitrinen" setMobileOpen={setMobileOpen} />
      <DataTable columns={[
        { key: "vitrine_id", label: "Vitrine", render: r => vitrines.find(v => v.vitrine_id === r.vitrine_id)?.location_name || r.vitrine_id },
        { key: "product_id", label: "Produkt", render: r => products.find(p => p.product_id === r.product_id)?.name || r.product_id },
        { key: "stock_qty", label: "Bestand", render: r => <span style={{ fontWeight: 700, color: r.stock_qty <= 2 ? k.r500 : r.stock_qty <= 5 ? k.y500 : k.g900 }}>{r.stock_qty}</span> },
      ]} data={stock} />
    </div>
  )
}

function AdminSalesPage({ setMobileOpen }) {
  const [sales, setSales] = useState([]); const [products, setProducts] = useState([]); const [vitrines, setVitrines] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([supabase.from("sales").select("*").order("sold_at", { ascending: false }).limit(100), supabase.from("products").select("*"), supabase.from("vitrines").select("*")])
      .then(([s, p, v]) => { setSales(s.data || []); setProducts(p.data || []); setVitrines(v.data || []); setLoading(false) })
  }, [])
  if (loading) return <LoadingSpinner />
  return (
    <div>
      <PageHeader title="Verkäufe" subtitle="Alle Verkäufe" setMobileOpen={setMobileOpen} />
      <DataTable columns={[
        { key: "sold_at", label: "Datum", render: r => r.sold_at ? new Date(r.sold_at).toLocaleString("de-DE") : "–" },
        { key: "vitrine_id", label: "Vitrine", render: r => vitrines.find(v => v.vitrine_id === r.vitrine_id)?.location_name || r.vitrine_id },
        { key: "product_id", label: "Produkt", render: r => products.find(p => p.product_id === r.product_id)?.name || r.product_id },
        { key: "qty", label: "Menge" },
        { key: "revenue", label: "Umsatz", render: r => r.revenue ? `${Number(r.revenue).toFixed(2)} €` : "–" },
      ]} data={sales} />
    </div>
  )
}

function AdminRefillPage({ setMobileOpen }) {
  const [tl, setTl] = useState([]); const [products, setProducts] = useState([]); const [vitrines, setVitrines] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([supabase.from("v_stock_traffic_light").select("*"), supabase.from("products").select("*"), supabase.from("vitrines").select("*")])
      .then(([t, p, v]) => { setTl(t.data || []); setProducts(p.data || []); setVitrines(v.data || []); setLoading(false) })
  }, [])
  if (loading) return <LoadingSpinner />
  const sorted = [...tl].sort((a, b) => ({ rot: 0, gelb: 1, "grün": 2 }[a.ampel] ?? 3) - ({ rot: 0, gelb: 1, "grün": 2 }[b.ampel] ?? 3))
  return (
    <div>
      <PageHeader title="Nachfüllbedarf" subtitle="Ampel-Übersicht" setMobileOpen={setMobileOpen} />
      <DataTable columns={[
        { key: "ampel", label: "Status", render: r => <AmpelBadge ampel={r.ampel} /> },
        { key: "vitrine_id", label: "Vitrine", render: r => vitrines.find(v => v.vitrine_id === r.vitrine_id)?.location_name || r.vitrine_id },
        { key: "product_id", label: "Produkt", render: r => products.find(p => p.product_id === r.product_id)?.name || r.product_id },
        { key: "stock_qty", label: "Bestand" }, { key: "min_stock", label: "Min" },
        { key: "target_stock", label: "Ziel", render: r => r.target_stock ? Number(r.target_stock).toFixed(0) : "–" },
      ]} data={sorted} />
    </div>
  )
}

function AdminProductsPage({ setMobileOpen }) {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ product_id: "", name: "", sku: "", standard_price: "", min_stock_per_vitrine: "", notes: "" })

  const load = async () => { const { data } = await supabase.from("products").select("*").order("name"); setProducts(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm({ product_id: "", name: "", sku: "", standard_price: "", min_stock_per_vitrine: "", notes: "" }); setModalOpen(true) }
  const openEdit = p => { setEditing(p); setForm({ ...p, standard_price: String(p.standard_price || ""), min_stock_per_vitrine: String(p.min_stock_per_vitrine || "") }); setModalOpen(true) }

  const handleSave = async () => {
    const payload = { name: form.name, sku: form.sku, standard_price: Number(form.standard_price) || null, min_stock_per_vitrine: Number(form.min_stock_per_vitrine) || null, notes: form.notes }
    if (editing) await supabase.from("products").update(payload).eq("product_id", editing.product_id)
    else await supabase.from("products").insert({ product_id: form.product_id, ...payload })
    setModalOpen(false); load()
  }
  const handleDelete = async p => { if (confirm(`"${p.name}" wirklich löschen?`)) { await supabase.from("products").delete().eq("product_id", p.product_id); load() } }

  if (loading) return <LoadingSpinner />
  return (
    <div>
      <PageHeader title="Produkte" subtitle="Produkte verwalten" setMobileOpen={setMobileOpen} action={<Btn onClick={openNew}><Plus size={18} /> Neues Produkt</Btn>} />
      <DataTable columns={[
        { key: "name", label: "Name" }, { key: "sku", label: "SKU" },
        { key: "standard_price", label: "Preis", render: r => r.standard_price ? `${Number(r.standard_price).toFixed(2)} €` : "–" },
        { key: "min_stock_per_vitrine", label: "Min. Bestand" },
        { key: "actions", label: "", render: r => (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Pencil size={16} color={k.g500} /></button>
            <button onClick={() => handleDelete(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={16} color={k.r500} /></button>
          </div>
        )},
      ]} data={products} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Produkt bearbeiten" : "Neues Produkt"}>
        {!editing && <InputField label="Produkt-ID" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} placeholder="z.B. prod_006" />}
        <InputField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <InputField label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
        <InputField label="Standardpreis (€)" type="number" value={form.standard_price} onChange={e => setForm(f => ({ ...f, standard_price: e.target.value }))} />
        <InputField label="Min. Bestand" type="number" value={form.min_stock_per_vitrine} onChange={e => setForm(f => ({ ...f, min_stock_per_vitrine: e.target.value }))} />
        <InputField label="Notizen" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Btn onClick={handleSave}><Save size={16} /> Speichern</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Abbrechen</Btn>
        </div>
      </Modal>
    </div>
  )
}

function AdminUsersPage({ setMobileOpen }) {
  const [users, setUsers] = useState([]); const [vitrines, setVitrines] = useState([]); const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false); const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ email: "", role: "seller", vitrine_id: "", active: true })

  const load = async () => {
    const [u, v] = await Promise.all([supabase.from("app_users").select("*").order("created_at", { ascending: false }), supabase.from("vitrines").select("*")])
    setUsers(u.data || []); setVitrines(v.data || []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openEdit = u => { setEditing(u); setForm({ email: u.email, role: u.role, vitrine_id: u.vitrine_id || "", active: u.active }); setModalOpen(true) }
  const handleSave = async () => {
    await supabase.from("app_users").update({ role: form.role, vitrine_id: form.vitrine_id || null, active: form.active }).eq("user_id", editing.user_id)
    setModalOpen(false); load()
  }

  if (loading) return <LoadingSpinner />
  return (
    <div>
      <PageHeader title="Nutzer" subtitle="Benutzer und Rollen" setMobileOpen={setMobileOpen} />
      <DataTable columns={[
        { key: "email", label: "E-Mail" },
        { key: "role", label: "Rolle", render: r => <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: r.role === "admin" ? "#dbeafe" : k.em100, color: r.role === "admin" ? "#1e40af" : "#065f46" }}>{r.role === "admin" ? "Admin" : "Verkäufer"}</span> },
        { key: "vitrine_id", label: "Vitrine", render: r => vitrines.find(v => v.vitrine_id === r.vitrine_id)?.location_name || r.vitrine_id || "–" },
        { key: "active", label: "Aktiv", render: r => r.active ? <CheckCircle size={16} color={k.gr500} /> : <XCircle size={16} color={k.r500} /> },
        { key: "actions", label: "", render: r => <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Pencil size={16} color={k.g500} /></button> },
      ]} data={users} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nutzer bearbeiten">
        <InputField label="E-Mail" value={form.email} disabled style={{ background: k.g100 }} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: k.g600, marginBottom: 6 }}>Rolle</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${k.g300}`, fontSize: 14, boxSizing: "border-box" }}>
            <option value="seller">Verkäufer</option><option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: k.g600, marginBottom: 6 }}>Vitrine</label>
          <select value={form.vitrine_id} onChange={e => setForm(f => ({ ...f, vitrine_id: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${k.g300}`, fontSize: 14, boxSizing: "border-box" }}>
            <option value="">– Keine –</option>
            {vitrines.map(v => <option key={v.vitrine_id} value={v.vitrine_id}>{v.location_name} ({v.city})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} id="act" />
          <label htmlFor="act" style={{ fontSize: 14, color: k.g700 }}>Aktiv</label>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn onClick={handleSave}><Save size={16} /> Speichern</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Abbrechen</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: appUser } = await supabase.from("app_users").select("*").eq("user_id", session.user.id).single()
        if (appUser) setUser({ ...session.user, appUser })
      }
      setChecking(false)
    })
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setActivePage("dashboard") }

  if (checking) return <LoadingSpinner />
  if (!user) return <LoginPage onLogin={setUser} />

  const role = user.appUser?.role || "seller"

  const renderPage = () => {
    if (role === "admin") {
      switch (activePage) {
        case "dashboard": return <AdminDashboard setMobileOpen={setMobileOpen} />
        case "vitrines": return <AdminVitrinesPage setMobileOpen={setMobileOpen} />
        case "stock": return <AdminStockPage setMobileOpen={setMobileOpen} />
        case "sales": return <AdminSalesPage setMobileOpen={setMobileOpen} />
        case "refill": return <AdminRefillPage setMobileOpen={setMobileOpen} />
        case "products": return <AdminProductsPage setMobileOpen={setMobileOpen} />
        case "users": return <AdminUsersPage setMobileOpen={setMobileOpen} />
        default: return <AdminDashboard setMobileOpen={setMobileOpen} />
      }
    }
    switch (activePage) {
      case "dashboard": return <SellerDashboard appUser={user.appUser} setMobileOpen={setMobileOpen} />
      case "sales": return <SellerSalesPage appUser={user.appUser} setMobileOpen={setMobileOpen} />
      default: return <SellerDashboard appUser={user.appUser} setMobileOpen={setMobileOpen} />
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: k.g50, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar role={role} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} userEmail={user.email} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content" style={{ flex: 1, padding: "28px 32px", minWidth: 0 }}>{renderPage()}</main>
      <style>{`
        @media (min-width: 768px) { .sidebar-desktop { display: block; } .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .sidebar-desktop { display: none; } .main-content { padding: 18px 14px !important; } }
        * { margin: 0; padding: 0; box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </div>
  )
}
