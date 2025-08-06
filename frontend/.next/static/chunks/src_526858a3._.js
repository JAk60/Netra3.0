(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "absoluteUrl": ()=>absoluteUrl,
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function absoluteUrl(path) {
    return "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_APP_URL).concat(path);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/registry/new-york-v4/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
            destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
            outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/button.tsx",
        lineNumber: 47,
        columnNumber: 12
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/registry/new-york-v4/ui/card.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": ()=>Card,
    "CardContent": ()=>CardContent,
    "CardDescription": ()=>CardDescription,
    "CardFooter": ()=>CardFooter,
    "CardHeader": ()=>CardHeader,
    "CardTitle": ()=>CardTitle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
_c = Card;
function CardHeader(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-1.5 px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 19,
        columnNumber: 12
    }, this);
}
_c1 = CardHeader;
function CardTitle(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 23,
        columnNumber: 12
    }, this);
}
_c2 = CardTitle;
function CardDescription(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 27,
        columnNumber: 12
    }, this);
}
_c3 = CardDescription;
function CardContent(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 31,
        columnNumber: 12
    }, this);
}
_c4 = CardContent;
function CardFooter(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 12
    }, this);
}
_c5 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardContent");
__turbopack_context__.k.register(_c5, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/registry/new-york-v4/ui/input.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Input": ()=>Input
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input(param) {
    let { className, type, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/registry/new-york-v4/ui/label.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Label": ()=>Label
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
;
function Label(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/label.tsx",
        lineNumber: 10,
        columnNumber: 9
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/auth.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Auth
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Auth() {
    _s();
    const [isSignUp, setIsSignUp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-authship min-h-screen bg-gradient-to-br from-slate-900 to-[#25547e] flex items-center justify-center p-4 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 to-slate-800/20"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/auth.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "w-full max-w-md p-8 backdrop-blur-lg bg-slate-800/20 border border-slate-300/20 shadow-2xl relative z-10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-3xl font-bold text-white",
                                                children: isSignUp ? "Create Account" : "Welcome Back"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 27,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-white/80",
                                                children: isSignUp ? "Join us and start your journey today" : "Sign in to your account to continue"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 28,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 26,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        className: "space-y-4",
                                        children: [
                                            isSignUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "name",
                                                        className: "text-white/90",
                                                        children: "Full Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "name",
                                                        type: "text",
                                                        placeholder: "Enter your full name",
                                                        className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 39,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 35,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "email",
                                                        className: "text-white/90",
                                                        children: "Email"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 50,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "email",
                                                        type: "email",
                                                        placeholder: "Enter your email",
                                                        className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 53,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 49,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "password",
                                                        className: "text-white/90",
                                                        children: "Password"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 63,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "password",
                                                        type: "password",
                                                        placeholder: "Enter your password",
                                                        className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 66,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 62,
                                                columnNumber: 17
                                            }, this),
                                            isSignUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "confirmPassword",
                                                        className: "text-white/90",
                                                        children: "Confirm Password"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 77,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "confirmPassword",
                                                        type: "password",
                                                        placeholder: "Confirm your password",
                                                        className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 76,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "submit",
                                                className: "w-full bg-slate-600/30 hover:bg-slate-500/40 text-slate-100 border border-slate-300/30 backdrop-blur-sm transition-all duration-200",
                                                children: isSignUp ? "Create Account" : "Sign In"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 90,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 33,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setIsSignUp(!isSignUp),
                                            className: "text-white/80 hover:text-white underline underline-offset-4 transition-colors",
                                            children: isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 99,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 flex items-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-full border-t border-white/30"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 110,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 109,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative flex justify-center text-xs uppercase",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "bg-transparent px-2 text-white/60",
                                                    children: "Or continue with"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 113,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 112,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "mr-2 h-4 w-4",
                                                        viewBox: "0 0 24 24",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 123,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 127,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 131,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 135,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Google"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "mr-2 h-4 w-4",
                                                        fill: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 146,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Twitter"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 142,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 117,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                lineNumber: 25,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/auth.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center lg:justify-start",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center lg:text-left space-y-8 max-w-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center lg:justify-start",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-20 h-20 rounded-2xl backdrop-blur-lg bg-slate-700/30 border border-slate-300/30 flex items-center justify-center shadow-2xl",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-10 h-10 text-slate-200",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 163,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 162,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                    lineNumber: 160,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-4xl lg:text-5xl font-bold text-white leading-tight",
                                            children: [
                                                "Welcome to",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block bg-gradient-to-r from-blue-300 to-slate-300 bg-clip-text text-transparent",
                                                    children: "NavalTech"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 175,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xl text-slate-200/80 leading-relaxed",
                                            children: "Advanced maritime technology solutions powering the next generation of naval operations and oceanic exploration."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 182,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 text-white/70",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-blue-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 189,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Trusted by naval forces worldwide"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 190,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-slate-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 193,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Military-grade security standards"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 194,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-blue-300"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 197,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "24/7 mission-critical support"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 198,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                                    lineNumber: 196,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 187,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                    lineNumber: 174,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden lg:block",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 206,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 207,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 208,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/auth.tsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/auth.tsx",
                            lineNumber: 158,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/auth.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/auth.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(Auth, "G5k7ZK0AyA5xuUnv6Qh+pLEEQ4U=");
_c = Auth;
var _c;
__turbopack_context__.k.register(_c, "Auth");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/use-debounce.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useDebounce": ()=>useDebounce
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const useDebounce = (value, delay)=>{
    _s();
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDebounce.useEffect": ()=>{
            const handler = setTimeout({
                "useDebounce.useEffect.handler": ()=>{
                    setDebouncedValue(value);
                }
            }["useDebounce.useEffect.handler"], delay);
            return ({
                "useDebounce.useEffect": ()=>{
                    clearTimeout(handler);
                }
            })["useDebounce.useEffect"];
        }
    }["useDebounce.useEffect"], [
        value,
        delay
    ]);
    return debouncedValue;
};
_s(useDebounce, "KDuPAtDOgxm8PU6legVJOb3oOmA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/chat-main.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>ChatMain
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-debounce.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ChatMain(param) {
    let { ships = [], toggleRightSidebar } = param;
    _s();
    // Consolidated state
    const [chatState, setChatState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        messages: [],
        isLoading: false,
        error: null,
        retryCount: 0
    });
    // Input and autocomplete state
    const [selectedMode, setSelectedMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showAutocomplete, setShowAutocomplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autocompletePosition, setAutocompletePosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autocompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const abortControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Debounced search query
    const debouncedSearchQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"])(searchQuery, 200) // M
    ;
}
_s(ChatMain, "vgUDn8zVgFgtLa1j2FUvJ1zQdFg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"]
    ];
});
_c = ChatMain;
var _c;
__turbopack_context__.k.register(_c, "ChatMain");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/registry/new-york-v4/ui/avatar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Avatar": ()=>Avatar,
    "AvatarFallback": ()=>AvatarFallback,
    "AvatarImage": ()=>AvatarImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-avatar/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
;
function Avatar(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "avatar",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative flex size-8 shrink-0 overflow-hidden rounded-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 10,
        columnNumber: 9
    }, this);
}
_c = Avatar;
function AvatarImage(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Image"], {
        "data-slot": "avatar-image",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('aspect-square size-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
_c1 = AvatarImage;
function AvatarFallback(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fallback"], {
        "data-slot": "avatar-fallback",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-muted flex size-full items-center justify-center rounded-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
_c2 = AvatarFallback;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Avatar");
__turbopack_context__.k.register(_c1, "AvatarImage");
__turbopack_context__.k.register(_c2, "AvatarFallback");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/left-sidebar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Leftsidebar
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/telescope.js [app-client] (ecmascript) <export default as Telescope>");
;
;
;
;
;
function Leftsidebar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " w-64 rounded-md bg-gradient-to-b from-[#9BA0AC]/60 to-[#1a1d25]/60 border-r  flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-4 p-4 border-b ",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-start items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__["Telescope"], {
                            className: "w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-amita text-4xl flex mt-1 ml-3",
                            children: "नेत्रा"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                            placeholder: "Search",
                            className: "pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground",
                            children: "⌘K"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-4 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "default",
                        className: "w-full justify-start gap-3 bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            "New Chat"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            "Documents",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                className: "w-4 h-4 ml-auto"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            "History"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-1 border-t border-sidebar-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-medium text-muted-foreground mb-2",
                        children: "Settings & Help"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            "Settings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            "Help"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-sidebar-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                            className: "w-8 h-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                    src: "/placeholder.svg?height=32&width=32"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                    children: "EC"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-medium text-sidebar-foreground",
                                    children: "Jhon Doe"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-muted-foreground truncate",
                                    children: "hey@unspace.agency"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = Leftsidebar;
var _c;
__turbopack_context__.k.register(_c, "Leftsidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>CustomEdge,
    "getSpecialPath": ()=>getSpecialPath
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
;
const getSpecialPath = (param, offsetX, offsetY)=>{
    let { sourceX, sourceY, targetX, targetY } = param;
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    return "M ".concat(sourceX, " ").concat(sourceY, " Q ").concat(centerX + offsetX, " ").concat(centerY + offsetY, " ").concat(targetX, " ").concat(targetY);
};
function CustomEdge(param) {
    let { id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label } = param;
    _s();
    const { isBiDirectional, isFirstEdge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "CustomEdge.useStore": (s)=>{
            // Check if there's a bidirectional connection
            const reverseEdge = s.edges.find({
                "CustomEdge.useStore.reverseEdge": (e)=>e.source === target && e.target === source
            }["CustomEdge.useStore.reverseEdge"]);
            const isBiDirectional = !!reverseEdge;
            // Determine if this is the "first" edge (for consistent spacing)
            const isFirstEdge = !reverseEdge || reverseEdge && id < reverseEdge.id;
            return {
                isBiDirectional,
                isFirstEdge
            };
        }
    }["CustomEdge.useStore"]);
    const edgePathParams = {
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    };
    let path = '';
    let labelX = 0;
    let labelY = 0;
    if (isBiDirectional) {
        // Calculate spacing based on edge direction and position
        const isHorizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
        const spacing = 45;
        let offsetX = 0;
        let offsetY = 0;
        if (isHorizontal) {
            // For horizontal edges, offset vertically
            offsetY = isFirstEdge ? -spacing : spacing;
        } else {
            // For vertical edges, offset horizontally
            offsetX = isFirstEdge ? -spacing : spacing;
            // Also add a small vertical offset for better separation
            offsetY = isFirstEdge ? -spacing / 2 : spacing / 2;
        }
        path = getSpecialPath(edgePathParams, offsetX, offsetY);
        // Calculate label position for curved path
        const centerX = (sourceX + targetX) / 2;
        const centerY = (sourceY + targetY) / 2;
        labelX = centerX + offsetX;
        labelY = centerY + offsetY;
    } else {
        [path, labelX, labelY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBezierPath"])(edgePathParams);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseEdge"], {
                path: path,
                markerEnd: markerEnd
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalEdge.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EdgeLabelRenderer"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        color: 'black',
                        transform: "translate(-50%, -50%) translate(".concat(labelX, "px,").concat(labelY, "px)"),
                        fontSize: 12,
                        fontWeight: 700,
                        background: 'white',
                        padding: '2px 6px',
                        borderRadius: 3,
                        border: '1px solid #ccc',
                        pointerEvents: 'all'
                    },
                    className: "nodrag nopan",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/BiDirectionalEdge.tsx",
                    lineNumber: 103,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalEdge.tsx",
                lineNumber: 102,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true);
}
_s(CustomEdge, "SFJn20hmuvuH+A9Db8b96OQ7/oY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"]
    ];
});
_c = CustomEdge;
var _c;
__turbopack_context__.k.register(_c, "CustomEdge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/BiDirectionalNode.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
;
;
;
const BiDirectionalNode = (param)=>{
    let { data } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: '#ffffff',
            border: '2px solid #1f2937',
            borderRadius: '12px',
            padding: '12px 20px',
            minWidth: '100px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Left,
                id: "left",
                style: {
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    left: '-8px'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
                lineNumber: 27,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Right,
                id: "right",
                style: {
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    right: '-8px'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
                lineNumber: 39,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top,
                id: "top",
                style: {
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    top: '-8px'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
                lineNumber: 51,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
                id: "bottom",
                style: {
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    bottom: '-8px'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            (data === null || data === void 0 ? void 0 : data.label) || 'Node'
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = BiDirectionalNode;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(BiDirectionalNode);
var _c, _c1;
__turbopack_context__.k.register(_c, "BiDirectionalNode");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/right-sidebar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dagre/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalNode.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const data = {
    "nodes": [
        {
            "id": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 50
            },
            "data": {
                "label": "INS ONE",
                "ship_category": "DESTROYER AND FRIGATES",
                "ship_class": "KOLKATA (P-15A)",
                "total_systems": 4,
                "node_type": "ship"
            },
            "style": {
                "background": "#1f2937",
                "color": "white",
                "border": "2px solid #3b82f6",
                "borderRadius": "8px",
                "width": 200,
                "height": 80
            }
        },
        {
            "id": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 200
            },
            "data": {
                "label": "Systems",
                "total_systems": 4,
                "total_system_types": 4,
                "node_type": "systems_collective"
            },
            "style": {
                "background": "#059669",
                "color": "white",
                "border": "2px solid #10b981",
                "borderRadius": "6px",
                "width": 150,
                "height": 60
            }
        },
        {
            "id": "system_type_SystemType.FIRING",
            "type": "bidirectional",
            "position": {
                "x": 650,
                "y": 350
            },
            "data": {
                "label": "firing",
                "system_type": "firing",
                "instances_count": 1,
                "node_type": "system_type"
            },
            "style": {
                "background": "#7c3aed",
                "color": "white",
                "border": "2px solid #8b5cf6",
                "borderRadius": "6px",
                "width": 120,
                "height": 50
            }
        },
        {
            "id": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 600
            },
            "data": {
                "label": "propulsion",
                "system_type": "propulsion",
                "instances_count": 1,
                "node_type": "system_type"
            },
            "style": {
                "background": "#7c3aed",
                "color": "white",
                "border": "2px solid #8b5cf6",
                "borderRadius": "6px",
                "width": 120,
                "height": 50
            }
        },
        {
            "id": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "position": {
                "x": 150,
                "y": 350.00000000000006
            },
            "data": {
                "label": "support",
                "system_type": "support",
                "instances_count": 1,
                "node_type": "system_type"
            },
            "style": {
                "background": "#7c3aed",
                "color": "white",
                "border": "2px solid #8b5cf6",
                "borderRadius": "6px",
                "width": 120,
                "height": 50
            }
        },
        {
            "id": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "position": {
                "x": 399.99999999999994,
                "y": 100
            },
            "data": {
                "label": "power_generation",
                "system_type": "power_generation",
                "instances_count": 1,
                "node_type": "system_type"
            },
            "style": {
                "background": "#7c3aed",
                "color": "white",
                "border": "2px solid #8b5cf6",
                "borderRadius": "6px",
                "width": 120,
                "height": 50
            }
        },
        {
            "id": "5358d044-9f4f-44cf-a975-341221f7189d",
            "type": "bidirectional",
            "position": {
                "x": 550,
                "y": 600
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
                "system_type": "propulsion",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 750
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
                "system_type": "propulsion",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "type": "bidirectional",
            "position": {
                "x": 250,
                "y": 600
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
                "system_type": "propulsion",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 450
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
                "system_type": "propulsion",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "443360a0-6218-486b-a34c-1813963177b7",
            "type": "bidirectional",
            "position": {
                "x": 550,
                "y": 100
            },
            "data": {
                "label": "Generator",
                "component_id": "443360a0-6218-486b-a34c-1813963177b7",
                "system_type": "power_generation",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "type": "bidirectional",
            "position": {
                "x": 399.99999999999994,
                "y": 250
            },
            "data": {
                "label": "Generator",
                "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
                "system_type": "power_generation",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "type": "bidirectional",
            "position": {
                "x": 249.99999999999994,
                "y": 100.00000000000001
            },
            "data": {
                "label": "Generator",
                "component_id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
                "system_type": "power_generation",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "type": "bidirectional",
            "position": {
                "x": 399.99999999999994,
                "y": -50
            },
            "data": {
                "label": "Generator",
                "component_id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
                "system_type": "power_generation",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "308804ec-bca2-45e9-b665-515de88ffa70",
            "type": "bidirectional",
            "position": {
                "x": 300,
                "y": 350.00000000000006
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "type": "bidirectional",
            "position": {
                "x": 225,
                "y": 479.90381056766586
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "type": "bidirectional",
            "position": {
                "x": 75.00000000000003,
                "y": 479.90381056766586
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "73c2a73c-0e92-4742-9775-af95e89e1841",
            "type": "bidirectional",
            "position": {
                "x": 0,
                "y": 350.00000000000006
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "type": "bidirectional",
            "position": {
                "x": 74.99999999999993,
                "y": 220.0961894323343
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "d10aa05d-1f80-436d-b612-f52e28c44676",
            "type": "bidirectional",
            "position": {
                "x": 225,
                "y": 220.09618943233426
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "d10aa05d-1f80-436d-b612-f52e28c44676",
                "system_type": "support",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "1c16dacf-69cd-4061-b004-113d85948c61",
            "type": "bidirectional",
            "position": {
                "x": 800,
                "y": 350
            },
            "data": {
                "label": "Missile",
                "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
                "system_type": "firing",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        },
        {
            "id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
            "type": "bidirectional",
            "position": {
                "x": 500,
                "y": 350
            },
            "data": {
                "label": "Super Rapid Gun Mount",
                "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
                "system_type": "firing",
                "node_type": "component"
            },
            "style": {
                "background": "#dc2626",
                "color": "white",
                "border": "2px solid #ef4444",
                "borderRadius": "4px",
                "width": 100,
                "height": 40
            }
        }
    ],
    "edges": [
        {
            "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-systems",
            "source": "33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_systems",
            "style": {
                "stroke": "#3b82f6",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "systems-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
            "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "are_on",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systems-to-type-SystemType.FIRING",
            "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "system_type_SystemType.FIRING",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_category",
            "style": {
                "stroke": "#7c3aed",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "type-SystemType.FIRING-to-systems",
            "source": "system_type_SystemType.FIRING",
            "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_a_type_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systems-to-type-SystemType.PROPULSION",
            "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_category",
            "style": {
                "stroke": "#7c3aed",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "type-SystemType.PROPULSION-to-systems",
            "source": "system_type_SystemType.PROPULSION",
            "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_a_type_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systems-to-type-SystemType.SUPPORT",
            "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_category",
            "style": {
                "stroke": "#7c3aed",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "type-SystemType.SUPPORT-to-systems",
            "source": "system_type_SystemType.SUPPORT",
            "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_a_type_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systems-to-type-SystemType.POWER_GENERATION",
            "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_category",
            "style": {
                "stroke": "#7c3aed",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "type-SystemType.POWER_GENERATION-to-systems",
            "source": "system_type_SystemType.POWER_GENERATION",
            "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_a_type_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.PROPULSION-to-component-5358d044-9f4f-44cf-a975-341221f7189d",
            "source": "system_type_SystemType.PROPULSION",
            "target": "5358d044-9f4f-44cf-a975-341221f7189d",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-5358d044-9f4f-44cf-a975-341221f7189d-to-systemtype-SystemType.PROPULSION",
            "source": "5358d044-9f4f-44cf-a975-341221f7189d",
            "target": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.PROPULSION-to-component-ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "source": "system_type_SystemType.PROPULSION",
            "target": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-ab055ca1-2aa1-4c55-a1b1-39ead450a131-to-systemtype-SystemType.PROPULSION",
            "source": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "target": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.PROPULSION-to-component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "source": "system_type_SystemType.PROPULSION",
            "target": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e-to-systemtype-SystemType.PROPULSION",
            "source": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "target": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.PROPULSION-to-component-da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "source": "system_type_SystemType.PROPULSION",
            "target": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-da570729-9a1e-4fa1-8399-e21c93c46e8f-to-systemtype-SystemType.PROPULSION",
            "source": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "target": "system_type_SystemType.PROPULSION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.POWER_GENERATION-to-component-443360a0-6218-486b-a34c-1813963177b7",
            "source": "system_type_SystemType.POWER_GENERATION",
            "target": "443360a0-6218-486b-a34c-1813963177b7",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-443360a0-6218-486b-a34c-1813963177b7-to-systemtype-SystemType.POWER_GENERATION",
            "source": "443360a0-6218-486b-a34c-1813963177b7",
            "target": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.POWER_GENERATION-to-component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "source": "system_type_SystemType.POWER_GENERATION",
            "target": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a-to-systemtype-SystemType.POWER_GENERATION",
            "source": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "target": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.POWER_GENERATION-to-component-1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "source": "system_type_SystemType.POWER_GENERATION",
            "target": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-1872dfb4-58f9-48d4-a713-953cd7e1048a-to-systemtype-SystemType.POWER_GENERATION",
            "source": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "target": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.POWER_GENERATION-to-component-c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "source": "system_type_SystemType.POWER_GENERATION",
            "target": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-c652b6b3-9d13-4e4d-833e-dd71aecd102b-to-systemtype-SystemType.POWER_GENERATION",
            "source": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "target": "system_type_SystemType.POWER_GENERATION",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-308804ec-bca2-45e9-b665-515de88ffa70",
            "source": "system_type_SystemType.SUPPORT",
            "target": "308804ec-bca2-45e9-b665-515de88ffa70",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-308804ec-bca2-45e9-b665-515de88ffa70-to-systemtype-SystemType.SUPPORT",
            "source": "308804ec-bca2-45e9-b665-515de88ffa70",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "source": "system_type_SystemType.SUPPORT",
            "target": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-38093be3-acb7-40db-80ec-542dfc8d5d7d-to-systemtype-SystemType.SUPPORT",
            "source": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "source": "system_type_SystemType.SUPPORT",
            "target": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0-to-systemtype-SystemType.SUPPORT",
            "source": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-73c2a73c-0e92-4742-9775-af95e89e1841",
            "source": "system_type_SystemType.SUPPORT",
            "target": "73c2a73c-0e92-4742-9775-af95e89e1841",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-73c2a73c-0e92-4742-9775-af95e89e1841-to-systemtype-SystemType.SUPPORT",
            "source": "73c2a73c-0e92-4742-9775-af95e89e1841",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "source": "system_type_SystemType.SUPPORT",
            "target": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20-to-systemtype-SystemType.SUPPORT",
            "source": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.SUPPORT-to-component-d10aa05d-1f80-436d-b612-f52e28c44676",
            "source": "system_type_SystemType.SUPPORT",
            "target": "d10aa05d-1f80-436d-b612-f52e28c44676",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-d10aa05d-1f80-436d-b612-f52e28c44676-to-systemtype-SystemType.SUPPORT",
            "source": "d10aa05d-1f80-436d-b612-f52e28c44676",
            "target": "system_type_SystemType.SUPPORT",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.FIRING-to-component-1c16dacf-69cd-4061-b004-113d85948c61",
            "source": "system_type_SystemType.FIRING",
            "target": "1c16dacf-69cd-4061-b004-113d85948c61",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-1c16dacf-69cd-4061-b004-113d85948c61-to-systemtype-SystemType.FIRING",
            "source": "1c16dacf-69cd-4061-b004-113d85948c61",
            "target": "system_type_SystemType.FIRING",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        },
        {
            "id": "systemtype-SystemType.FIRING-to-component-db30946a-2baf-49e4-9ceb-ec72365089b4",
            "source": "system_type_SystemType.FIRING",
            "target": "db30946a-2baf-49e4-9ceb-ec72365089b4",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_equipment",
            "style": {
                "stroke": "#10b981",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600
            }
        },
        {
            "id": "component-db30946a-2baf-49e4-9ceb-ec72365089b4-to-systemtype-SystemType.FIRING",
            "source": "db30946a-2baf-49e4-9ceb-ec72365089b4",
            "target": "system_type_SystemType.FIRING",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "is_part_of",
            "style": {
                "stroke": "#6b7280",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400
            }
        }
    ],
    "metadata": {
        "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
        "ship_name": "INS ONE",
        "total_nodes": 22,
        "total_edges": 42,
        "hierarchy": {
            "ships": 1,
            "systems": 1,
            "system_types": 4,
            "components": 16
        }
    }
};
const initialNodes = data.nodes;
const initialEdges = data.edges;
const dagreGraph = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(()=>({}));
const nodeWidth = 272;
const nodeHeight = 180;
const getLayoutedElements = function(nodes, edges) {
    let direction = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'TB';
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 100,
        nodesep: 50
    });
    nodes.forEach((node)=>{
        dagreGraph.setNode(node.id, {
            width: nodeWidth,
            height: nodeHeight
        });
    });
    edges.forEach((edge)=>{
        dagreGraph.setEdge(edge.source, edge.target);
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].layout(dagreGraph);
    const layoutedNodes = nodes.map((node)=>{
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Left : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top,
            sourcePosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Right : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2
            }
        };
        return newNode;
    });
    return {
        nodes: layoutedNodes,
        edges
    };
};
const edgeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
};
const nodeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
};
const AutoLayoutFlow = ()=>{
    _s();
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(initialEdges);
    const { fitView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AutoLayoutFlow.useCallback[onConnect]": (params)=>setEdges({
                "AutoLayoutFlow.useCallback[onConnect]": (eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addEdge"])(params, eds)
            }["AutoLayoutFlow.useCallback[onConnect]"])
    }["AutoLayoutFlow.useCallback[onConnect]"], [
        setEdges
    ]);
    const onLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AutoLayoutFlow.useCallback[onLayout]": (direction)=>{
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
            setNodes([
                ...layoutedNodes
            ]);
            setEdges([
                ...layoutedEdges
            ]);
            window.requestAnimationFrame({
                "AutoLayoutFlow.useCallback[onLayout]": ()=>{
                    fitView();
                }
            }["AutoLayoutFlow.useCallback[onLayout]"]);
        }
    }["AutoLayoutFlow.useCallback[onLayout]"], [
        nodes,
        edges,
        setNodes,
        setEdges,
        fitView
    ]);
    // Auto-layout on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoLayoutFlow.useEffect": ()=>{
            onLayout('LR');
        }
    }["AutoLayoutFlow.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex border-white rounded-md bg-black/80 h-screen w-1/2 text-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
            nodes: nodes,
            edges: edges,
            onNodesChange: onNodesChange,
            onEdgesChange: onEdgesChange,
            onConnect: onConnect,
            nodeTypes: nodeTypes,
            edgeTypes: edgeTypes,
            fitView: true,
            attributionPosition: "top-right",
            connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {}, void 0, false, {
                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                    lineNumber: 1513,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {}, void 0, false, {
                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                    lineNumber: 1514,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
            lineNumber: 1501,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
        lineNumber: 1471,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AutoLayoutFlow, "jcslaI9VOOiMvj6ltBbBsHN01JQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"]
    ];
});
_c = AutoLayoutFlow;
const __TURBOPACK__default__export__ = AutoLayoutFlow;
var _c;
__turbopack_context__.k.register(_c, "AutoLayoutFlow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Drishti/chat-layout.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>ChatLayout
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-main.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$left$2d$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/left-sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$right$2d$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/right-sidebar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ChatLayout(param) {
    let { ships } = param;
    _s();
    const [showRightSidebar, setShowRightSidebar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$left$2d$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-layout.tsx",
                lineNumber: 17,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                ships: ships,
                toggleRightSidebar: ()=>setShowRightSidebar(!showRightSidebar),
                showRightSidebar: showRightSidebar
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-layout.tsx",
                lineNumber: 19,
                columnNumber: 13
            }, this),
            showRightSidebar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$right$2d$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-layout.tsx",
                lineNumber: 25,
                columnNumber: 34
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/chat-layout.tsx",
        lineNumber: 16,
        columnNumber: 9
    }, this);
}
_s(ChatLayout, "j/RIxUCg6ovM2VcfnSsfNu4ews0=");
_c = ChatLayout;
var _c;
__turbopack_context__.k.register(_c, "ChatLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_526858a3._.js.map