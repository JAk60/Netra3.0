module.exports = {

"[project]/src/registry/new-york-v4/ui/input-otp.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "InputOTP": ()=>InputOTP,
    "InputOTPGroup": ()=>InputOTPGroup,
    "InputOTPSeparator": ()=>InputOTPSeparator,
    "InputOTPSlot": ()=>InputOTPSlot
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$input$2d$otp$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/input-otp/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as MinusIcon>");
'use client';
;
;
;
;
;
function InputOTP({ className, containerClassName, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$input$2d$otp$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OTPInput"], {
        "data-slot": "input-otp",
        containerClassName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 has-disabled:opacity-50', containerClassName),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('disabled:cursor-not-allowed', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
        lineNumber: 18,
        columnNumber: 9
    }, this);
}
function InputOTPGroup({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "input-otp-group",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
        lineNumber: 28,
        columnNumber: 12
    }, this);
}
function InputOTPSlot({ index, className, ...props }) {
    const inputOTPContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$input$2d$otp$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OTPInputContext"]);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "input-otp-slot",
        "data-active": isActive,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]', className),
        ...props,
        children: [
            char,
            hasFakeCaret && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-caret-blink bg-foreground h-4 w-px duration-1000"
                }, void 0, false, {
                    fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
                    lineNumber: 53,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
                lineNumber: 52,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
        lineNumber: 42,
        columnNumber: 9
    }, this);
}
function InputOTPSeparator({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "input-otp-separator",
        role: "separator",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusIcon$3e$__["MinusIcon"], {}, void 0, false, {
            fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
            lineNumber: 63,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input-otp.tsx",
        lineNumber: 62,
        columnNumber: 9
    }, this);
}
;
}),
"[project]/node_modules/input-otp/dist/index.mjs [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "OTPInput": ()=>Lt,
    "OTPInputContext": ()=>jt,
    "REGEXP_ONLY_CHARS": ()=>Jt,
    "REGEXP_ONLY_DIGITS": ()=>Kt,
    "REGEXP_ONLY_DIGITS_AND_CHARS": ()=>Qt
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var Bt = Object.defineProperty, At = Object.defineProperties;
var kt = Object.getOwnPropertyDescriptors;
var Y = Object.getOwnPropertySymbols;
var gt = Object.prototype.hasOwnProperty, Et = Object.prototype.propertyIsEnumerable;
var vt = (r, s, e)=>s in r ? Bt(r, s, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: e
    }) : r[s] = e, St = (r, s)=>{
    for(var e in s || (s = {}))gt.call(s, e) && vt(r, e, s[e]);
    if (Y) for (var e of Y(s))Et.call(s, e) && vt(r, e, s[e]);
    return r;
}, bt = (r, s)=>At(r, kt(s));
var Pt = (r, s)=>{
    var e = {};
    for(var u in r)gt.call(r, u) && s.indexOf(u) < 0 && (e[u] = r[u]);
    if (r != null && Y) for (var u of Y(r))s.indexOf(u) < 0 && Et.call(r, u) && (e[u] = r[u]);
    return e;
};
;
function ht(r) {
    let s = setTimeout(r, 0), e = setTimeout(r, 10), u = setTimeout(r, 50);
    return [
        s,
        e,
        u
    ];
}
;
function _t(r) {
    let s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"]();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        s.current = r;
    }), s.current;
}
;
var Ot = 18, wt = 40, Gt = `${wt}px`, xt = [
    "[data-lastpass-icon-root]",
    "com-1password-button",
    "[data-dashlanecreated]",
    '[style$="2147483647 !important;"]'
].join(",");
function Tt({ containerRef: r, inputRef: s, pushPasswordManagerStrategy: e, isFocused: u }) {
    let [P, D] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!1), [G, H] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!1), [F, W] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!1), Z = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>e === "none" ? !1 : (e === "increase-width" || e === "experimental-no-flickering") && P && G, [
        P,
        G,
        e
    ]), T = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](()=>{
        let f = r.current, h = s.current;
        if (!f || !h || F || e === "none") return;
        let a = f, B = a.getBoundingClientRect().left + a.offsetWidth, A = a.getBoundingClientRect().top + a.offsetHeight / 2, z = B - Ot, q = A;
        document.querySelectorAll(xt).length === 0 && document.elementFromPoint(z, q) === f || (D(!0), W(!0));
    }, [
        r,
        s,
        F,
        e
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        let f = r.current;
        if (!f || e === "none") return;
        function h() {
            let A = window.innerWidth - f.getBoundingClientRect().right;
            H(A >= wt);
        }
        h();
        let a = setInterval(h, 1e3);
        return ()=>{
            clearInterval(a);
        };
    }, [
        r,
        e
    ]), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        let f = u || document.activeElement === s.current;
        if (e === "none" || !f) return;
        let h = setTimeout(T, 0), a = setTimeout(T, 2e3), B = setTimeout(T, 5e3), A = setTimeout(()=>{
            W(!0);
        }, 6e3);
        return ()=>{
            clearTimeout(h), clearTimeout(a), clearTimeout(B), clearTimeout(A);
        };
    }, [
        s,
        u,
        e,
        T
    ]), {
        hasPWMBadge: P,
        willPushPWMBadge: Z,
        PWM_BADGE_SPACE_WIDTH: Gt
    };
}
var jt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"]({}), Lt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((A, B)=>{
    var z = A, { value: r, onChange: s, maxLength: e, textAlign: u = "left", pattern: P, placeholder: D, inputMode: G = "numeric", onComplete: H, pushPasswordManagerStrategy: F = "increase-width", pasteTransformer: W, containerClassName: Z, noScriptCSSFallback: T = Nt, render: f, children: h } = z, a = Pt(z, [
        "value",
        "onChange",
        "maxLength",
        "textAlign",
        "pattern",
        "placeholder",
        "inputMode",
        "onComplete",
        "pushPasswordManagerStrategy",
        "pasteTransformer",
        "containerClassName",
        "noScriptCSSFallback",
        "render",
        "children"
    ]);
    var X, lt, ut, dt, ft;
    let [q, nt] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](typeof a.defaultValue == "string" ? a.defaultValue : ""), i = r != null ? r : q, I = _t(i), x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((t)=>{
        s == null || s(t), nt(t);
    }, [
        s
    ]), m = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>P ? typeof P == "string" ? new RegExp(P) : P : null, [
        P
    ]), l = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null), K = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null), J = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"]({
        value: i,
        onChange: x,
        isIOS: "undefined" != "undefined" && ((lt = (X = window == null ? void 0 : window.CSS) == null ? void 0 : X.supports) == null ? void 0 : lt.call(X, "-webkit-touch-callout", "none"))
    }), V = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"]({
        prev: [
            (ut = l.current) == null ? void 0 : ut.selectionStart,
            (dt = l.current) == null ? void 0 : dt.selectionEnd,
            (ft = l.current) == null ? void 0 : ft.selectionDirection
        ]
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"](B, ()=>l.current, []), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        let t = l.current, o = K.current;
        if (!t || !o) return;
        J.current.value !== t.value && J.current.onChange(t.value), V.current.prev = [
            t.selectionStart,
            t.selectionEnd,
            t.selectionDirection
        ];
        function d() {
            if (document.activeElement !== t) {
                L(null), N(null);
                return;
            }
            let c = t.selectionStart, b = t.selectionEnd, mt = t.selectionDirection, v = t.maxLength, C = t.value, _ = V.current.prev, g = -1, E = -1, w;
            if (C.length !== 0 && c !== null && b !== null) {
                let Dt = c === b, Ht = c === C.length && C.length < v;
                if (Dt && !Ht) {
                    let y = c;
                    if (y === 0) g = 0, E = 1, w = "forward";
                    else if (y === v) g = y - 1, E = y, w = "backward";
                    else if (v > 1 && C.length > 1) {
                        let et = 0;
                        if (_[0] !== null && _[1] !== null) {
                            w = y < _[1] ? "backward" : "forward";
                            let Wt = _[0] === _[1] && _[0] < v;
                            w === "backward" && !Wt && (et = -1);
                        }
                        g = et + y, E = et + y + 1;
                    }
                }
                g !== -1 && E !== -1 && g !== E && l.current.setSelectionRange(g, E, w);
            }
            let pt = g !== -1 ? g : c, Rt = E !== -1 ? E : b, yt = w != null ? w : mt;
            L(pt), N(Rt), V.current.prev = [
                pt,
                Rt,
                yt
            ];
        }
        if (document.addEventListener("selectionchange", d, {
            capture: !0
        }), d(), document.activeElement === t && Q(!0), !document.getElementById("input-otp-style")) {
            let c = document.createElement("style");
            if (c.id = "input-otp-style", document.head.appendChild(c), c.sheet) {
                let b = "background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";
                $(c.sheet, "[data-input-otp]::selection { background: transparent !important; color: transparent !important; }"), $(c.sheet, `[data-input-otp]:autofill { ${b} }`), $(c.sheet, `[data-input-otp]:-webkit-autofill { ${b} }`), $(c.sheet, "@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }"), $(c.sheet, "[data-input-otp] + * { pointer-events: all !important; }");
            }
        }
        let R = ()=>{
            o && o.style.setProperty("--root-height", `${t.clientHeight}px`);
        };
        R();
        let p = new ResizeObserver(R);
        return p.observe(t), ()=>{
            document.removeEventListener("selectionchange", d, {
                capture: !0
            }), p.disconnect();
        };
    }, []);
    let [ot, rt] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!1), [j, Q] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!1), [M, L] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null), [k, N] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        ht(()=>{
            var R, p, c, b;
            (R = l.current) == null || R.dispatchEvent(new Event("input"));
            let t = (p = l.current) == null ? void 0 : p.selectionStart, o = (c = l.current) == null ? void 0 : c.selectionEnd, d = (b = l.current) == null ? void 0 : b.selectionDirection;
            t !== null && o !== null && (L(t), N(o), V.current.prev = [
                t,
                o,
                d
            ]);
        });
    }, [
        i,
        j
    ]), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        I !== void 0 && i !== I && I.length < e && i.length === e && (H == null || H(i));
    }, [
        e,
        H,
        I,
        i
    ]);
    let O = Tt({
        containerRef: K,
        inputRef: l,
        pushPasswordManagerStrategy: F,
        isFocused: j
    }), st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((t)=>{
        let o = t.currentTarget.value.slice(0, e);
        if (o.length > 0 && m && !m.test(o)) {
            t.preventDefault();
            return;
        }
        typeof I == "string" && o.length < I.length && document.dispatchEvent(new Event("selectionchange")), x(o);
    }, [
        e,
        x,
        I,
        m
    ]), at = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](()=>{
        var t;
        if (l.current) {
            let o = Math.min(l.current.value.length, e - 1), d = l.current.value.length;
            (t = l.current) == null || t.setSelectionRange(o, d), L(o), N(d);
        }
        Q(!0);
    }, [
        e
    ]), ct = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((t)=>{
        var g, E;
        let o = l.current;
        if (!W && (!J.current.isIOS || !t.clipboardData || !o)) return;
        let d = t.clipboardData.getData("text/plain"), R = W ? W(d) : d;
        t.preventDefault();
        let p = (g = l.current) == null ? void 0 : g.selectionStart, c = (E = l.current) == null ? void 0 : E.selectionEnd, v = (p !== c ? i.slice(0, p) + R + i.slice(c) : i.slice(0, p) + R + i.slice(p)).slice(0, e);
        if (v.length > 0 && m && !m.test(v)) return;
        o.value = v, x(v);
        let C = Math.min(v.length, e - 1), _ = v.length;
        o.setSelectionRange(C, _), L(C), N(_);
    }, [
        e,
        x,
        m,
        i
    ]), It = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
            position: "relative",
            cursor: a.disabled ? "default" : "text",
            userSelect: "none",
            WebkitUserSelect: "none",
            pointerEvents: "none"
        }), [
        a.disabled
    ]), it = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
            position: "absolute",
            inset: 0,
            width: O.willPushPWMBadge ? `calc(100% + ${O.PWM_BADGE_SPACE_WIDTH})` : "100%",
            clipPath: O.willPushPWMBadge ? `inset(0 ${O.PWM_BADGE_SPACE_WIDTH} 0 0)` : void 0,
            height: "100%",
            display: "flex",
            textAlign: u,
            opacity: "1",
            color: "transparent",
            pointerEvents: "all",
            background: "transparent",
            caretColor: "transparent",
            border: "0 solid transparent",
            outline: "0 solid transparent",
            boxShadow: "none",
            lineHeight: "1",
            letterSpacing: "-.5em",
            fontSize: "var(--root-height)",
            fontFamily: "monospace",
            fontVariantNumeric: "tabular-nums"
        }), [
        O.PWM_BADGE_SPACE_WIDTH,
        O.willPushPWMBadge,
        u
    ]), Mt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("input", bt(St({
            autoComplete: a.autoComplete || "one-time-code"
        }, a), {
            "data-input-otp": !0,
            "data-input-otp-placeholder-shown": i.length === 0 || void 0,
            "data-input-otp-mss": M,
            "data-input-otp-mse": k,
            inputMode: G,
            pattern: m == null ? void 0 : m.source,
            "aria-placeholder": D,
            style: it,
            maxLength: e,
            value: i,
            ref: l,
            onPaste: (t)=>{
                var o;
                ct(t), (o = a.onPaste) == null || o.call(a, t);
            },
            onChange: st,
            onMouseOver: (t)=>{
                var o;
                rt(!0), (o = a.onMouseOver) == null || o.call(a, t);
            },
            onMouseLeave: (t)=>{
                var o;
                rt(!1), (o = a.onMouseLeave) == null || o.call(a, t);
            },
            onFocus: (t)=>{
                var o;
                at(), (o = a.onFocus) == null || o.call(a, t);
            },
            onBlur: (t)=>{
                var o;
                Q(!1), (o = a.onBlur) == null || o.call(a, t);
            }
        })), [
        st,
        at,
        ct,
        G,
        it,
        e,
        k,
        M,
        a,
        m == null ? void 0 : m.source,
        i
    ]), tt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
            slots: Array.from({
                length: e
            }).map((t, o)=>{
                var c;
                let d = j && M !== null && k !== null && (M === k && o === M || o >= M && o < k), R = i[o] !== void 0 ? i[o] : null, p = i[0] !== void 0 ? null : (c = D == null ? void 0 : D[o]) != null ? c : null;
                return {
                    char: R,
                    placeholderChar: p,
                    isActive: d,
                    hasFakeCaret: d && R === null
                };
            }),
            isFocused: j,
            isHovering: !a.disabled && ot
        }), [
        j,
        ot,
        e,
        k,
        M,
        a.disabled,
        i
    ]), Ct = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>f ? f(tt) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](jt.Provider, {
            value: tt
        }, h), [
        h,
        tt,
        f
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, T !== null && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("noscript", null, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("style", null, T)), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("div", {
        ref: K,
        "data-input-otp-container": !0,
        style: It,
        className: Z
    }, Ct, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("div", {
        style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none"
        }
    }, Mt)));
});
Lt.displayName = "Input";
function $(r, s) {
    try {
        r.insertRule(s);
    } catch (e) {
        console.error("input-otp could not insert CSS rule:", s);
    }
}
var Nt = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`;
var Kt = "^\\d+$", Jt = "^[a-zA-Z]+$", Qt = "^[a-zA-Z0-9]+$";
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s({
    "__iconNode": ()=>__iconNode,
    "default": ()=>Minus
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M5 12h14",
            key: "1ays0h"
        }
    ]
];
const Minus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("minus", __iconNode);
;
 //# sourceMappingURL=minus.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as MinusIcon>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "MinusIcon": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript)");
}),

};

//# sourceMappingURL=_3fdb5fbc._.js.map