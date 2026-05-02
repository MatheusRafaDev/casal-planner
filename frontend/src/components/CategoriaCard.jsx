// CategoriaCard.jsx
// ─── NOVIDADES ────────────────────────────────────────────────────────────────
// • Swipe direita  → marca/desmarca comprado (verde)
// • Swipe esquerda → abre confirm de exclusão (vermelho)
// • Clique no nome do item → abre modal de edição
// • Modal de item gerenciado pelo Planejamento (sem ItemFormModal interno)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronUp,
  ShoppingBag, Store, ExternalLink,
  ArrowUp, ArrowDown, AlertCircle, Clock, CheckCircle,
  Calendar, Filter, X, MoreHorizontal, Check,
} from "lucide-react";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import storeLogoService from "../services/storeLogoService";
import * as S from "../styles/components/CategoriaCardStyles";

const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const PRIORIDADE_CONFIG = {
  urgente:     { label:"Urgente",      emoji:"🔴", color:"#ef4444", bgColor:"#ef444418", icon:AlertCircle },
  normal:      { label:"Normal",       emoji:"🟡", color:"#f59e0b", bgColor:"#f59e0b18", icon:Clock },
  pode_esperar:{ label:"Pode esperar", emoji:"🟢", color:"#22c55e", bgColor:"#22c55e18", icon:CheckCircle },
};

const DATA_FILTROS = {
  todos:    { label:"Todos",           emoji:"📅", dias:null },
  hoje:     { label:"Hoje",            emoji:"🌅", dias:0 },
  ultimos7: { label:"Últimos 7 dias",  emoji:"📆", dias:7 },
  ultimos30:{ label:"Últimos 30 dias", emoji:"📅", dias:30 },
  esteMes:  { label:"Este mês",        emoji:"📊", tipo:"mes" },
};

const isAddedInRange = (createdAt, filtro) => {
  if (!createdAt || filtro === "todos") return true;
  if (filtro === "esteMes") {
    const d = new Date(createdAt), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }
  const cfg = DATA_FILTROS[filtro];
  if (cfg?.dias !== undefined && cfg.dias !== null) {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const limite = new Date(hoje); limite.setDate(hoje.getDate() - cfg.dias);
    const di = new Date(createdAt); di.setHours(0,0,0,0);
    return di >= limite;
  }
  return true;
};

const isAddedToday = (createdAt) => {
  if (!createdAt) return false;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(createdAt); d.setHours(0,0,0,0);
  return d.getTime() === t.getTime();
};

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, theme, type="danger" }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 200);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onConfirm(); onClose(); }, 200);
  }, [onConfirm, onClose]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) handleClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  const colors = {
    background:   theme?.surface || theme?.background || "#fff",
    overlay:      "rgba(0,0,0,0.55)",
    text:         theme?.text || "#111",
    textSecondary:theme?.textSoft || "#666",
    border:       theme?.border || "#e5e7eb",
    cancel:       theme?.surface || "#f3f4f6",
    cancelHover:  theme?.border || "#e5e7eb",
  };
  const typeConfig = {
    danger:  { buttonBg:"#ef4444", buttonHover:"#dc2626", icon:"⚠️" },
    warning: { buttonBg:"#f59e0b", buttonHover:"#d97706",  icon:"⚠️" },
    info:    { buttonBg:"#3b82f6", buttonHover:"#2563eb",  icon:"ℹ️" },
  };
  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:colors.overlay, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20000 }} onClick={handleClose}>
      <style>{`@keyframes cdFI{from{opacity:0}to{opacity:1}} @keyframes cdSI{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} @keyframes cdSO{from{transform:scale(1);opacity:1}to{transform:scale(.95);opacity:0}}`}</style>
      <div style={{ backgroundColor:colors.background, borderRadius:"16px", width:"90%", maxWidth:"400px", boxShadow:"0 20px 25px -5px rgba(0,0,0,.15)", border:`1px solid ${colors.border}`, animation: isClosing ? "cdSO .2s ease-out" : "cdSI .2s ease-out" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
            <span style={{ fontSize:"32px" }}>{config.icon}</span>
            <h3 style={{ margin:0, fontSize:"18px", fontWeight:600, color:colors.text }}>{title}</h3>
          </div>
          <p style={{ margin:"0 0 24px", color:colors.textSecondary, fontSize:"14px", lineHeight:1.5 }}>{message}</p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end" }}>
            <button onClick={handleClose} style={{ padding:"8px 16px", borderRadius:"8px", border:`1px solid ${colors.border}`, backgroundColor:colors.cancel, color:colors.text, cursor:"pointer", fontSize:"14px", fontWeight:500 }} onMouseEnter={e=>e.currentTarget.style.backgroundColor=colors.cancelHover} onMouseLeave={e=>e.currentTarget.style.backgroundColor=colors.cancel}>{cancelText||"Cancelar"}</button>
            <button onClick={handleConfirm} style={{ padding:"8px 16px", borderRadius:"8px", border:"none", backgroundColor:config.buttonBg, color:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:500 }} onMouseEnter={e=>e.currentTarget.style.backgroundColor=config.buttonHover} onMouseLeave={e=>e.currentTarget.style.backgroundColor=config.buttonBg}>{confirmText||"Confirmar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── MenuItem ────────────────────────────────────────────────────────────────
const MenuItem = memo(({ icon:Icon, label, onClick, color, hoverBg }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", cursor:"pointer", background:hov?hoverBg:"transparent", color, fontSize:"14px", fontWeight:500, whiteSpace:"nowrap", transition:"background .2s" }}>
      <Icon size={16}/><span>{label}</span>
    </div>
  );
});

// ─── ContextMenu ─────────────────────────────────────────────────────────────
const ContextMenu = memo(({ anchorRef, item, onClose, onEdit, onDelete, onOpenLink, theme }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ x:-9999, y:-9999 });
  const [visible, setVisible] = useState(false);
  const isMobile = useRef(isMobileDevice());

  const calc = useCallback(() => {
    if (!anchorRef?.current || !menuRef.current) return;
    const a = anchorRef.current.getBoundingClientRect(), m = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, sp = 8, ep = 8;
    let x = a.right + sp, y = a.top;
    if (x + m.width > vw - ep) x = a.left - m.width - sp;
    if (y + m.height > vh - ep) y = vh - m.height - ep;
    if (y < ep) y = a.bottom + sp;
    x = Math.max(ep, Math.min(x, vw - m.width - ep)); y = Math.max(ep, y);
    setPos({ x, y });
  }, [anchorRef]);

  useEffect(() => {
    if (!anchorRef?.current) return;
    const t = setTimeout(() => { calc(); setVisible(true); }, 10);
    return () => clearTimeout(t);
  }, [anchorRef, calc]);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener("scroll", calc, true);
    window.addEventListener("resize", calc);
    return () => { window.removeEventListener("scroll", calc, true); window.removeEventListener("resize", calc); };
  }, [visible, calc]);

  useEffect(() => {
    if (!visible) return;
    const out = (e) => { if (menuRef.current && !menuRef.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) onClose(); };
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    const t = setTimeout(() => { document.addEventListener("mousedown", out); document.addEventListener("touchstart", out); document.addEventListener("keydown", esc); }, isMobile.current ? 100 : 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", out); document.removeEventListener("touchstart", out); document.removeEventListener("keydown", esc); };
  }, [visible, onClose, anchorRef]);

  const colors = { background:theme?.surface||"#fff", border:theme?.border||"#e5e7eb", text:theme?.text||"#111", hover:theme?.border||"#f3f4f6", danger:"#ef4444", dangerHover:"#ef444418" };
  const items = [
    { icon:Pencil, label:"Editar item", onClick:()=>{ onEdit(); setTimeout(onClose,0); }, color:colors.text, hoverBg:colors.hover },
    { icon:Trash2, label:"Excluir item", onClick:()=>{ onDelete(); setTimeout(onClose,0); }, color:colors.danger, hoverBg:colors.dangerHover },
    ...(item.linkProduto ? [{ icon:ExternalLink, label:"Abrir link", onClick:()=>{ onOpenLink(); setTimeout(onClose,0); }, color:colors.text, hoverBg:colors.hover }] : []),
  ];

  return (
    <div ref={menuRef} style={{ position:"fixed", top:pos.y, left:pos.x, zIndex:10000, opacity:visible?1:0, transform:visible?"scale(1)":"scale(.95)", transition:"opacity .15s ease-out, transform .15s ease-out", visibility:pos.x!==-9999?"visible":"hidden" }}>
      <div style={{ background:colors.background, borderRadius:"12px", boxShadow:"0 4px 24px rgba(0,0,0,.2)", border:`1px solid ${colors.border}`, padding:"8px 0", minWidth:isMobile.current?"180px":"160px", maxWidth:"280px", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        {items.map(mi => <MenuItem key={mi.label} {...mi}/>)}
      </div>
    </div>
  );
});

// ─── StoreLogo ───────────────────────────────────────────────────────────────
const StoreLogo = memo(({ storeName, size="small" }) => {
  const [err, setErr] = useState(false);
  const sz = size==="small" ? 12 : 16;
  if (!storeName || err) return <S.StoreIconFallback size={size} theme={{}}><Store size={sz}/></S.StoreIconFallback>;
  return <S.StoreLogoImage src={storeLogoService.getLogoUrl(storeName, size==="small"?16:32)} alt={storeName} size={size} loading="lazy" onError={()=>setErr(true)}/>;
});

// ─── SwipeableItemCard ────────────────────────────────────────────────────────
// Swipe direita → comprado | Swipe esquerda → deletar | Clique no nome → editar
const SWIPE_THRESHOLD   = 72;   // px para ativar ação
const SWIPE_MAX         = 120;  // px máximo de arraste visual
const SWIPE_ACTIVATE_AT = 96;   // px para "travar" na posição de confirmação

const ItemCard = memo(({
  item, isLoading, isSaving, draggedItemId,
  onToggleComprado, onEditItem, onDeleteItem,
  onDragStart, onDragEnd, theme,
}) => {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Swipe state
  const [swipeX, setSwipeX]         = useState(0);
  const [swiping, setSwiping]       = useState(false);
  const [swipeDir, setSwipeDir]     = useState(null); // 'right' | 'left'
  const [swipeLocked, setSwipeLocked] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartT = useRef(0);
  const isScrolling = useRef(false);
  const swipeRef    = useRef({ x:0, locked:false, dir:null });
  const menuRef     = useRef(null);

  const pc       = PRIORIDADE_CONFIG[item.prioridade] || PRIORIDADE_CONFIG.normal;
  const disabled = isLoading || isSaving;

  const fmtData = (iso) => iso ? new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}) : null;

  // ─── Swipe handlers ──────────────────────────────────────────────────────
  const resetSwipe = useCallback((animate = true) => {
    swipeRef.current = { x:0, locked:false, dir:null };
    setSwipeX(0);
    setSwiping(false);
    setSwipeDir(null);
    setSwipeLocked(false);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (disabled || menuOpen) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchStartT.current = Date.now();
    isScrolling.current = false;
  }, [disabled, menuOpen]);

  const onTouchMove = useCallback((e) => {
    if (disabled || menuOpen) return;
    const t   = e.touches[0];
    const dx  = t.clientX - touchStartX.current;
    const dy  = t.clientY - touchStartY.current;

    // Determina se é scroll vertical — ignora swipe
    if (!swiping && Math.abs(dy) > Math.abs(dx) + 5) {
      isScrolling.current = true;
      return;
    }
    if (isScrolling.current) return;

    // Ignora arraste muito pequeno
    if (!swiping && Math.abs(dx) < 8) return;

    e.preventDefault(); // evita scroll enquanto swipa

    const dir = dx > 0 ? "right" : "left";

    if (!swiping) {
      setSwiping(true);
      setSwipeDir(dir);
    }

    // Limita o arraste
    const clamped = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx));
    swipeRef.current.x   = clamped;
    swipeRef.current.dir = dir;
    setSwipeX(clamped);
  }, [disabled, menuOpen, swiping]);

  const onTouchEnd = useCallback(() => {
    if (!swiping || isScrolling.current) { resetSwipe(); return; }

    const { x, dir } = swipeRef.current;
    const absX = Math.abs(x);

    if (absX >= SWIPE_THRESHOLD) {
      if (dir === "right") {
        // Marca/desmarca comprado
        onToggleComprado(item.id);
        // Animação: desliza para fora brevemente e volta
        setSwipeX(SWIPE_MAX * 1.5);
        setTimeout(resetSwipe, 300);
      } else {
        // Abre confirm de exclusão
        setConfirmOpen(true);
        resetSwipe();
      }
    } else {
      resetSwipe();
    }
  }, [swiping, resetSwipe, onToggleComprado, item.id]);

  // ─── Outros handlers ──────────────────────────────────────────────────────
  const openLink  = useCallback(() => { if (item.linkProduto) window.open(item.linkProduto,"_blank","noopener,noreferrer"); }, [item.linkProduto]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const editClick = useCallback(() => onEditItem(item.id), [onEditItem, item.id]);
  const delClick  = useCallback(() => { setConfirmOpen(true); setMenuOpen(false); }, []);
  const confirmDel= useCallback(() => { onDeleteItem(item.id); setConfirmOpen(false); }, [onDeleteItem, item.id]);
  const toggleMenu= useCallback(e => { e.stopPropagation(); setMenuOpen(p=>!p); }, []);

  // Clique no nome → abre edição
  const handleNameClick = useCallback((e) => {
    if (swiping) return; // não abre durante swipe
    e.stopPropagation();
    onEditItem(item.id);
  }, [swiping, onEditItem, item.id]);

  const dragStart = useCallback(e => {
    if (disabled) { e.preventDefault(); return; }
    e.stopPropagation();
    const id = String(item.id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    if (e.dataTransfer.setDragImage) {
      const el = Object.assign(document.createElement("div"),{textContent:"📦"});
      el.style.cssText = "position:absolute;top:-1000px";
      document.body.appendChild(el);
      e.dataTransfer.setDragImage(el,0,0);
      setTimeout(()=>document.body.removeChild(el),0);
    }
    onDragStart(id);
  }, [disabled, item.id, onDragStart]);

  const dragEnd = useCallback(e => { e.stopPropagation(); onDragEnd(); }, [onDragEnd]);

  // ─── Cores do swipe ──────────────────────────────────────────────────────
  const swipeProgress = Math.min(Math.abs(swipeX) / SWIPE_THRESHOLD, 1);
  const isRight = swipeDir === "right";
  const isLeft  = swipeDir === "left";

  const bgColor = swiping
    ? isRight
      ? `rgba(34,197,94,${swipeProgress * 0.25})`
      : `rgba(239,68,68,${swipeProgress * 0.25})`
    : "transparent";

  const revealColor = isRight ? "#22c55e" : "#ef4444";
  const revealIcon  = isRight
    ? <Check size={28} strokeWidth={3} color="#fff"/>
    : <Trash2 size={24} strokeWidth={2} color="#fff"/>;

  return (
    <>
      {/* Container com overflow hidden para o reveal */}
      <div style={{ position:"relative", borderRadius:"0.75rem", overflow:"hidden", marginBottom:"0" }}>

        {/* Reveal layer (fundo que aparece atrás) */}
        {swiping && (
          <div style={{
            position:"absolute", inset:0, borderRadius:"0.75rem",
            backgroundColor: revealColor,
            display:"flex",
            alignItems:"center",
            justifyContent: isRight ? "flex-start" : "flex-end",
            padding:"0 20px",
            opacity: swipeProgress,
            transition: "opacity .1s",
          }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              {revealIcon}
              <span style={{ color:"#fff", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.05em" }}>
                {isRight ? (item.comprado ? "DESMARCAR" : "COMPRADO") : "EXCLUIR"}
              </span>
            </div>
          </div>
        )}

        {/* Card deslizável */}
        <div
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: swiping ? "none" : "transform .3s cubic-bezier(.25,.46,.45,.94)",
            backgroundColor: swiping ? bgColor : "transparent",
            borderRadius:"0.75rem",
            touchAction: "pan-y",
            willChange: "transform",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <S.ItemRow
            $purchased={item.comprado}
            $priority={item.prioridade}
            theme={theme}
            $isDragging={draggedItemId === String(item.id)}
            draggable={!disabled}
            onDragStart={dragStart}
            onDragEnd={dragEnd}
            style={{ marginBottom:0 }}
          >
            <S.ItemMainRow>
              <S.CheckboxButton
                $checked={item.comprado}
                onClick={e=>{ e.stopPropagation(); onToggleComprado(item.id); }}
                theme={theme}
                disabled={disabled}
              >
                {item.comprado && <S.CheckIcon/>}
              </S.CheckboxButton>

              {/* Nome clicável → abre edição */}
              <S.ItemName
                $purchased={item.comprado}
                theme={theme}
                onClick={handleNameClick}
                style={{
                  cursor: "pointer",
                  textDecoration: item.comprado ? "line-through" : "underline",
                  textDecorationColor: item.comprado ? "inherit" : `${theme?.primary || "#3b82f6"}50`,
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "3px",
                }}
                title="Clique para editar"
              >
                {item.nome}
              </S.ItemName>

              <S.ItemTotalCompact>
                <S.ItemTotalValueCompact theme={theme}>
                  {formatarMoeda(item.preco * item.quantidade)}
                </S.ItemTotalValueCompact>
              </S.ItemTotalCompact>

              <S.ItemActionsDesktop>
                {item.linkProduto && (
                  <S.ItemActionButton onClick={openLink} theme={theme} variant="link" disabled={disabled} title="Abrir link">
                    <ExternalLink size={13}/>
                  </S.ItemActionButton>
                )}
                <S.ItemActionButton onClick={editClick} theme={theme} variant="edit" disabled={disabled} title="Editar">
                  <Pencil size={13}/>
                </S.ItemActionButton>
                <S.ItemActionButton variant="delete" onClick={delClick} theme={theme} disabled={disabled} title="Excluir">
                  <Trash2 size={13}/>
                </S.ItemActionButton>
              </S.ItemActionsDesktop>

              <S.ItemActionsMobile>
                <S.ItemActionButton ref={menuRef} onClick={toggleMenu} theme={theme} variant="menu" disabled={disabled} title="Menu">
                  <MoreHorizontal size={16}/>
                </S.ItemActionButton>
              </S.ItemActionsMobile>
            </S.ItemMainRow>

            <S.ItemDetailsRow>
              <S.PriorityBadgeFull $color={pc.color} $bgColor={pc.bgColor} theme={theme}>
                {pc.emoji} {pc.label}
              </S.PriorityBadgeFull>
              {item.createdAt && <S.DateBadge theme={theme}><Calendar size={10}/>{fmtData(item.createdAt)}</S.DateBadge>}
              {isAddedToday(item.createdAt) && <S.NewBadge>Novo</S.NewBadge>}
              <S.ItemQuantityBadge theme={theme}><ShoppingBag size={10}/>{item.quantidade}x</S.ItemQuantityBadge>
              <S.ItemPriceBadge theme={theme}>{formatarMoeda(item.preco)}/un</S.ItemPriceBadge>
              {item.loja && (
                <S.StoreBadge theme={theme}>
                  <StoreLogo storeName={item.loja} size="small"/>
                  <S.StoreName theme={theme}>{item.loja.length>16?item.loja.substring(0,16)+"…":item.loja}</S.StoreName>
                </S.StoreBadge>
              )}
              <S.PaymentBadge $type={item.pagamento} theme={theme}>
                {getPaymentIcon(item.pagamento)}{item.pagamento==="vr"?" VR/VA":" Normal"}
              </S.PaymentBadge>
              {item.marca && <S.ItemBrand theme={theme}>{item.marca}</S.ItemBrand>}
            </S.ItemDetailsRow>
          </S.ItemRow>
        </div>
      </div>

      {menuOpen && (
        <ContextMenu anchorRef={menuRef} item={item} onClose={closeMenu}
          onEdit={editClick} onDelete={delClick} onOpenLink={openLink} theme={theme}/>
      )}

      <ConfirmDialog
        isOpen={confirmOpen} onClose={()=>setConfirmOpen(false)} onConfirm={confirmDel}
        title="Excluir item"
        message={`Tem certeza que deseja excluir "${item.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir" cancelText="Cancelar" theme={theme} type="danger"/>
    </>
  );
});

// ─── CategoriaCard ────────────────────────────────────────────────────────────
const CategoriaCard = ({
  categoria, itens,
  onAddItem,         // (categoriaId) => void
  onUpdateItem,      // (itemId) => void
  onDeleteItem,      // (itemId) => Promise
  onDeleteCategoria, // (categoriaId) => Promise
  onEditCategoria,   // (categoria) => void  — objeto completo
  onItemDragStart, onItemDragEnd, onItemDrop,
  draggedItemId, theme, onToggleComprado, isLoading = false,
}) => {
  const [expanded, setExpanded]   = useState(true);
  const [dragOver, setDragOver]   = useState(false);
  const [sortBy, setSortBy]       = useState("preco");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSaving, setIsSaving]   = useState(false);
  const [filtroData, setFiltroData] = useState("todos");
  const [showFiltro, setShowFiltro] = useState(false);
  const [showDelCat, setShowDelCat] = useState(false);

  const disabled = isLoading || isSaving;

  const handleDelCatClick   = useCallback(() => { if (disabled) return; setShowDelCat(true); }, [disabled]);
  const handleConfirmDelCat = useCallback(async () => { await onDeleteCategoria(categoria.id); setShowDelCat(false); }, [categoria.id, onDeleteCategoria]);
  const handleEditCat       = useCallback(() => { if (disabled) return; onEditCategoria(categoria); }, [disabled, categoria, onEditCategoria]);
  const handleAddItem       = useCallback(() => { if (disabled) return; onAddItem(categoria.id); }, [disabled, categoria.id, onAddItem]);
  const handleEditItem      = useCallback((itemId) => onUpdateItem(itemId), [onUpdateItem]);
  const handleDeleteItem    = useCallback(async (itemId) => { if (disabled) return; await onDeleteItem(itemId); }, [disabled, onDeleteItem]);
  const handleToggle        = useCallback(async (itemId) => { if (disabled) return; await onToggleComprado(itemId); }, [disabled, onToggleComprado]);

  const itensFiltrados = useMemo(() => {
    if (filtroData === "todos") return itens;
    return itens.filter(i => isAddedInRange(i.createdAt, filtroData));
  }, [itens, filtroData]);

  const itensOrdenados = useMemo(() => {
    const s = [...itensFiltrados];
    const po = { urgente:0, normal:1, pode_esperar:2 };
    if (sortBy==="prioridade") s.sort((a,b)=>{ const d=(po[a.prioridade]??1)-(po[b.prioridade]??1); return sortOrder==="asc"?d:-d; });
    else if (sortBy==="preco") s.sort((a,b)=>{ const d=a.preco*a.quantidade-b.preco*b.quantidade; return sortOrder==="asc"?d:-d; });
    else if (sortBy==="nome")  s.sort((a,b)=>{ const d=a.nome.toLowerCase().localeCompare(b.nome.toLowerCase()); return sortOrder==="asc"?d:-d; });
    else if (sortBy==="data")  s.sort((a,b)=>{ const d=new Date(a.createdAt||0)-new Date(b.createdAt||0); return sortOrder==="asc"?d:-d; });
    return s;
  }, [itensFiltrados, sortBy, sortOrder]);

  const totalCat   = useMemo(() => itens.reduce((a,i)=>a+(i.preco*i.quantidade||0),0),[itens]);
  const totalFilt  = useMemo(() => itensFiltrados.reduce((a,i)=>a+(i.preco*i.quantidade||0),0),[itensFiltrados]);
  const comprados  = itens.filter(i=>i.comprado).length;
  const progresso  = itens.length > 0 ? (comprados/itens.length)*100 : 0;
  const totalGasto = useMemo(() => itens.filter(i=>i.comprado).reduce((a,i)=>a+(i.preco*i.quantidade||0),0),[itens]);
  const pctMeta    = categoria.metaOrcamento > 0 ? (totalCat/categoria.metaOrcamento)*100 : 0;
  const excedeu    = totalCat > categoria.metaOrcamento;
  const proximo    = !excedeu && pctMeta >= 80;

  const handleSort = useCallback(field => {
    if (disabled) return;
    setSortBy(prev => { if (prev===field){ setSortOrder(o=>o==="asc"?"desc":"asc"); return prev; } setSortOrder("asc"); return field; });
  }, [disabled]);
  const handleClearSort = useCallback(() => { if (disabled) return; setSortBy("preco"); setSortOrder("asc"); }, [disabled]);
  const hasSort = sortBy!=="preco" || sortOrder!=="asc";

  const onDragOver  = useCallback(e => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }, []);
  const onDragLeave = useCallback(e => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }, []);
  const onDrop      = useCallback(e => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const id=e.dataTransfer.getData("text/plain"); if(id) onItemDrop(categoria.id,id); }, [onItemDrop, categoria.id]);

  const hasFiltro = filtroData !== "todos";

  return (
    <>
      <S.CardContainer theme={theme} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} $isDragOver={dragOver}>
        <S.CardHeader color={categoria.bg} theme={theme}>
          <S.HeaderLeft>
            <S.DragHandle theme={theme}/>
            <S.Icon>{categoria.icon}</S.Icon>
            <S.TitleSection>
              <S.Title theme={theme}>{categoria.nome}</S.Title>
              <S.Subtitle>
                <S.ItemsCount theme={theme}>{itens.length} {itens.length===1?"item":"itens"}</S.ItemsCount>
                <S.TotalValue theme={theme}>{formatarMoeda(totalCat)}</S.TotalValue>
                {categoria.metaOrcamento > 0 && (
                  <S.MetaBadge $excedeu={excedeu} $proximo={proximo} theme={theme} title={excedeu?`Excedeu ${formatarMoeda(totalCat-categoria.metaOrcamento)}`:`Restam ${formatarMoeda(categoria.metaOrcamento-totalCat)}`}>
                    🎯 {formatarMoeda(categoria.metaOrcamento)}
                  </S.MetaBadge>
                )}
              </S.Subtitle>
            </S.TitleSection>
          </S.HeaderLeft>

          <S.HeaderActions>
            <div style={{position:"relative"}}>
              <S.IconButton onClick={()=>setShowFiltro(p=>!p)} theme={theme} title="Filtrar por data" disabled={disabled} $active={hasFiltro}><Filter size={18}/></S.IconButton>
              {showFiltro && (
                <S.FiltroDataDropdown theme={theme}>
                  <S.FiltroHeader theme={theme}><span>Filtrar por data</span><button onClick={()=>setShowFiltro(false)}><X size={14}/></button></S.FiltroHeader>
                  {Object.entries(DATA_FILTROS).map(([k,cfg])=>(
                    <S.FiltroOption key={k} $active={filtroData===k} theme={theme} onClick={()=>{setFiltroData(k);setShowFiltro(false);}}><span>{cfg.emoji}</span>{cfg.label}</S.FiltroOption>
                  ))}
                  {hasFiltro && <S.FiltroClear theme={theme} onClick={()=>{setFiltroData("todos");setShowFiltro(false);}}>Limpar filtro</S.FiltroClear>}
                </S.FiltroDataDropdown>
              )}
            </div>
            <S.IconButton onClick={handleAddItem} theme={theme} title="Adicionar item" disabled={disabled}><Plus size={18}/></S.IconButton>
            <S.IconButton onClick={handleEditCat} theme={theme} title="Editar categoria" disabled={disabled}><Pencil size={16}/></S.IconButton>
            <S.IconButton danger onClick={handleDelCatClick} theme={theme} title="Excluir categoria" disabled={disabled}><Trash2 size={16}/></S.IconButton>
            <S.ExpandButton onClick={()=>setExpanded(p=>!p)} theme={theme}>{expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</S.ExpandButton>
          </S.HeaderActions>
        </S.CardHeader>

        <S.CardContent>
          {expanded && (
            <>
              {hasFiltro && (
                <S.FiltroAtivoBadge theme={theme}>
                  <Calendar size={12}/>{DATA_FILTROS[filtroData]?.label}
                  <button onClick={()=>setFiltroData("todos")}><X size={12}/></button>
                </S.FiltroAtivoBadge>
              )}

              {itens.length > 0 && (
                <S.SortBar theme={theme}>
                  <S.SortLabel theme={theme}>Ordenar:</S.SortLabel>
                  <S.SortButtonsGroup>
                    {[{field:"preco",label:"Preço",emoji:"💰"},{field:"nome",label:"Nome",emoji:"📝"},{field:"prioridade",label:"Prioridade",emoji:"🎯"},{field:"data",label:"Data",emoji:"📅"}].map(({field,label,emoji})=>(
                      <S.SortButton key={field} $active={sortBy===field} onClick={()=>handleSort(field)} disabled={disabled} theme={theme}>
                        {emoji} {label}
                        {sortBy===field && <S.SortIcon>{sortOrder==="asc"?<ArrowUp size={12}/>:<ArrowDown size={12}/>}</S.SortIcon>}
                      </S.SortButton>
                    ))}
                  </S.SortButtonsGroup>
                  {hasSort && <S.SortClearButton onClick={handleClearSort} disabled={disabled} theme={theme}><X size={12}/>Limpar</S.SortClearButton>}
                </S.SortBar>
              )}

              {/* Dica de swipe — só aparece em dispositivos touch */}
              {itens.length > 0 && (
                <div style={{
                  display:"flex", justifyContent:"center", gap:"16px",
                  padding:"4px 12px 6px",
                  fontSize:"0.65rem", color:theme?.textSoft||"#999",
                  userSelect:"none",
                }}>
                </div>
              )}

              <S.CategoryProgress theme={theme}>
                <S.ProgressBar theme={theme}><S.ProgressFill theme={theme} style={{width:`${progresso}%`}} color={categoria.bg}/></S.ProgressBar>
              </S.CategoryProgress>

              {hasFiltro && itensFiltrados.length!==itens.length && (
                <S.FiltroInfo theme={theme}>
                  Mostrando {itensFiltrados.length} de {itens.length} itens
                  {totalFilt!==totalCat && ` · Total: ${formatarMoeda(totalFilt)}`}
                </S.FiltroInfo>
              )}

              {isLoading ? (
                [1,2,3].map(n=><S.ItemSkeletonWrapper key={n}><S.ItemSkeleton theme={theme}/></S.ItemSkeletonWrapper>)
              ) : itensOrdenados.length > 0 ? (
                <S.ItemsList>
                  {itensOrdenados.map(item=>(
                    <ItemCard
                      key={item.id} item={item}
                      isLoading={isLoading} isSaving={isSaving}
                      draggedItemId={draggedItemId}
                      onToggleComprado={handleToggle}
                      onEditItem={handleEditItem}
                      onDeleteItem={handleDeleteItem}
                      onDragStart={onItemDragStart}
                      onDragEnd={onItemDragEnd}
                      theme={theme}
                    />
                  ))}
                </S.ItemsList>
              ) : (
                <S.EmptyState>
                  <S.EmptyIcon>{hasFiltro?"🔍":"📦"}</S.EmptyIcon>
                  <S.EmptyText theme={theme}>{hasFiltro?"Nenhum item neste período":"Nenhum item adicionado"}</S.EmptyText>
                  {!hasFiltro && <S.AddButton onClick={handleAddItem} theme={theme} disabled={disabled}><Plus size={16}/>Adicionar primeiro item</S.AddButton>}
                  {hasFiltro  && <S.AddButton onClick={()=>setFiltroData("todos")} theme={theme}><X size={16}/>Limpar filtro</S.AddButton>}
                </S.EmptyState>
              )}
            </>
          )}
        </S.CardContent>

        <S.CategoryFooter theme={theme}>
          <S.CategoryStats>
            <S.StatItem theme={theme}><span>📦</span><strong>{comprados}/{itens.length}</strong><span>comprados</span></S.StatItem>
            <S.StatItem theme={theme}><span>📊</span><strong>{progresso.toFixed(0)}%</strong></S.StatItem>
            <S.StatItem theme={theme}><span>💰</span><strong>{formatarMoeda(totalGasto)}</strong></S.StatItem>
          </S.CategoryStats>
        </S.CategoryFooter>
      </S.CardContainer>

      <ConfirmDialog
        isOpen={showDelCat} onClose={()=>setShowDelCat(false)} onConfirm={handleConfirmDelCat}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${categoria.nome}"? Todos os itens serão removidos e esta ação não pode ser desfeita.`}
        confirmText="Excluir" cancelText="Cancelar" theme={theme} type="danger"/>
    </>
  );
};

export default memo(CategoriaCard);