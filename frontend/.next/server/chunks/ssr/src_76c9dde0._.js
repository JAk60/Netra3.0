module.exports = {

"[project]/src/lib/utils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "absoluteUrl": ()=>absoluteUrl,
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function absoluteUrl(path) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
}),
"[project]/src/registry/new-york-v4/ui/button.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
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
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
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
;
}),
"[project]/src/registry/new-york-v4/ui/card.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Card": ()=>Card,
    "CardContent": ()=>CardContent,
    "CardDescription": ()=>CardDescription,
    "CardFooter": ()=>CardFooter,
    "CardHeader": ()=>CardHeader,
    "CardTitle": ()=>CardTitle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-1.5 px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 19,
        columnNumber: 12
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 23,
        columnNumber: 12
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 27,
        columnNumber: 12
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 31,
        columnNumber: 12
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 12
    }, this);
}
;
}),
"[project]/src/registry/new-york-v4/ui/input.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Input": ()=>Input
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
;
}),
"[project]/src/registry/new-york-v4/ui/label.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Label": ()=>Label
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/label.tsx",
        lineNumber: 10,
        columnNumber: 9
    }, this);
}
;
}),
"[project]/src/components/Drishti/auth.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>Auth
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/label.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function Auth() {
    const [isSignUp, setIsSignUp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-authship min-h-screen bg-gradient-to-br from-slate-900 to-[#25547e] flex items-center justify-center p-4 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 to-slate-800/20"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/auth.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                            className: "w-full max-w-md p-8 backdrop-blur-lg bg-slate-800/20 border border-slate-300/20 shadow-2xl relative z-10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-3xl font-bold text-white",
                                                children: isSignUp ? "Create Account" : "Welcome Back"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 27,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        className: "space-y-4",
                                        children: [
                                            isSignUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "name",
                                                        className: "text-white/90",
                                                        children: "Full Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "email",
                                                        className: "text-white/90",
                                                        children: "Email"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 50,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "password",
                                                        className: "text-white/90",
                                                        children: "Password"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 63,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
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
                                            isSignUp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "confirmPassword",
                                                        className: "text-white/90",
                                                        children: "Confirm Password"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/auth.tsx",
                                                        lineNumber: 77,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 flex items-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative flex justify-center text-xs uppercase",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "mr-2 h-4 w-4",
                                                        viewBox: "0 0 24 24",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 123,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 127,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fill: "currentColor",
                                                                d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                                lineNumber: 131,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                className: "backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "mr-2 h-4 w-4",
                                                        fill: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center lg:justify-start",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center lg:text-left space-y-8 max-w-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center lg:justify-start",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-20 h-20 rounded-2xl backdrop-blur-lg bg-slate-700/30 border border-slate-300/30 flex items-center justify-center shadow-2xl",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-10 h-10 text-slate-200",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-4xl lg:text-5xl font-bold text-white leading-tight",
                                            children: [
                                                "Welcome to",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xl text-slate-200/80 leading-relaxed",
                                            children: "Advanced maritime technology solutions powering the next generation of naval operations and oceanic exploration."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                            lineNumber: 182,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 text-white/70",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-blue-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 189,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-slate-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 193,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center lg:justify-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-blue-300"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Drishti/auth.tsx",
                                                            lineNumber: 197,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden lg:block",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 206,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/auth.tsx",
                                                lineNumber: 207,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
"[project]/src/hooks/use-debounce.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "useDebounce": ()=>useDebounce
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const useDebounce = (value, delay)=>{
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = setTimeout(()=>{
            setDebouncedValue(value);
        }, delay);
        return ()=>{
            clearTimeout(handler);
        };
    }, [
        value,
        delay
    ]);
    return debouncedValue;
};
}),
"[project]/src/registry/new-york-v4/ui/avatar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Avatar": ()=>Avatar,
    "AvatarFallback": ()=>AvatarFallback,
    "AvatarImage": ()=>AvatarImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-avatar/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function Avatar({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "avatar",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('relative flex size-8 shrink-0 overflow-hidden rounded-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 10,
        columnNumber: 9
    }, this);
}
function AvatarImage({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Image"], {
        "data-slot": "avatar-image",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('aspect-square size-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
function AvatarFallback({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fallback"], {
        "data-slot": "avatar-fallback",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('bg-muted flex size-full items-center justify-center rounded-full', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/avatar.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
;
}),
"[project]/src/components/Drishti/chat-input.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "AutocompleteDropdown": ()=>AutocompleteDropdown,
    "ChatErrorBoundary": ()=>ChatErrorBoundary,
    "default": ()=>ChatInput,
    "fuzzySearch": ()=>fuzzySearch
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as EyeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
;
class ChatErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Chat Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex items-center justify-center p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-destructive",
                            children: "Something went wrong"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 26,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground",
                            children: "Please refresh the page to continue"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>window.location.reload(),
                            children: "Refresh Page"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 25,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-input.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
const fuzzySearch = (query, ships)=>{
    if (!query.trim()) return ships.slice(0, 10);
    const searchTerm = query.toLowerCase();
    return ships.map((ship)=>{
        const name = ship.ship_name.toLowerCase();
        const class_ = ship.ship_class?.toLowerCase() || '';
        const category = ship.ship_category?.toLowerCase() || '';
        // Exact match gets highest score
        if (name === searchTerm) return {
            ship,
            score: 100
        };
        // Starts with search term
        if (name.startsWith(searchTerm)) return {
            ship,
            score: 90
        };
        // Contains search term
        if (name.includes(searchTerm)) return {
            ship,
            score: 80
        };
        // Class or category match
        if (class_.includes(searchTerm) || category.includes(searchTerm)) {
            return {
                ship,
                score: 70
            };
        }
        // Fuzzy character matching
        let score = 0;
        let searchIndex = 0;
        for(let i = 0; i < name.length && searchIndex < searchTerm.length; i++){
            if (name[i] === searchTerm[searchIndex]) {
                score += 1;
                searchIndex++;
            }
        }
        // If we matched all characters, calculate fuzzy score
        if (searchIndex === searchTerm.length) {
            const fuzzyScore = score / name.length * 60;
            return {
                ship,
                score: fuzzyScore
            };
        }
        return null;
    }).filter((item)=>item !== null).sort((a, b)=>b.score - a.score).slice(0, 10).map((item)=>item.ship);
};
function AutocompleteDropdown({ show, ships, position, selectedIndex, onSelect, onMouseEnter, forwardRef }) {
    if (!show) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: forwardRef,
        className: "absolute z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-80",
        style: {
            top: `${position.top}px`,
            left: `${position.left}px`
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs font-medium text-muted-foreground mb-2 px-2",
                    children: [
                        "Ships (",
                        ships.length,
                        ")"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this),
                ships.map((ship, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `px-3 py-2 rounded-md cursor-pointer flex flex-col gap-1 ${index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`,
                        onClick: ()=>onSelect(ship),
                        onMouseEnter: ()=>onMouseEnter(index),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-medium text-sm",
                                children: ship.ship_name
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                lineNumber: 129,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    ship.ship_class,
                                    " • ",
                                    ship.ship_category,
                                    " • ",
                                    ship.command
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        ]
                    }, ship.ship_id, true, {
                        fileName: "[project]/src/components/Drishti/chat-input.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, this)),
                ships.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-3 py-2 text-sm text-muted-foreground",
                    children: "No ships found"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 136,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/chat-input.tsx",
            lineNumber: 115,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/chat-input.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
function ChatInput({ toggleRightSidebar, inputValue, onChange, onKeyDown, onSend, isLoading, forwardRef }) {
    const [selectedButton, setSelectedButton] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleButtonClick = (buttonName)=>{
        setSelectedButton(buttonName);
        toggleRightSidebar(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 border-border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-card/70 border border-border rounded-lg p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                    ref: forwardRef,
                                    value: inputValue,
                                    onChange: onChange,
                                    onKeyDown: onKeyDown,
                                    placeholder: "Ask about components... Use @ship_name=SHIP_NAME, nomenclature=NOMENCLATURE, duration=HOURS",
                                    className: "flex-1 border-0 focus-visible:ring-0 text-base bg-transparent",
                                    disabled: isLoading
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 173,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    size: "icon",
                                    onClick: onSend,
                                    disabled: isLoading || !inputValue.trim(),
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-4 h-4 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                        lineNumber: 189,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                        lineNumber: 191,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 182,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mt-3 pt-3 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: selectedButton === 'drishti' ? 'default' : 'ghost',
                                            size: "sm",
                                            className: "gap-2",
                                            disabled: isLoading,
                                            onClick: ()=>handleButtonClick('drishti'),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__["EyeIcon"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 17
                                                }, this),
                                                "Drishti"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                            lineNumber: 198,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: selectedButton === 'browse' ? 'default' : 'ghost',
                                            size: "sm",
                                            className: "gap-2",
                                            disabled: isLoading,
                                            onClick: ()=>handleButtonClick('browse'),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 17
                                                }, this),
                                                "Browse Prompts"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                            lineNumber: 208,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 197,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-muted-foreground",
                                    children: [
                                        inputValue.length,
                                        " / 3,000"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 219,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-muted-foreground text-center mt-3",
                    children: "etra may generate inaccurate information please confirm first"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 225,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/chat-input.tsx",
            lineNumber: 170,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/chat-input.tsx",
        lineNumber: 169,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/Drishti/sqlresulttable.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>SQLResultsTable
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function SQLResultsTable({ aiResponse }) {
    if (!aiResponse.result || aiResponse.result.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-6 p-4 bg-muted/50 rounded-lg border border-border",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground text-center",
                children: "No results found"
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                lineNumber: 5,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
            lineNumber: 4,
            columnNumber: 7
        }, this);
    }
    const results = aiResponse.result;
    const allColumns = Object.keys(results[0]);
    const columns = allColumns.filter((column)=>{
        const lowerColumn = column.toLowerCase();
        return !lowerColumn.endsWith('id') && !lowerColumn.endsWith('_id');
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6 space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card/70 border border-border rounded-lg p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold text-foreground",
                                children: "Query Results"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 21,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-muted-foreground",
                                children: [
                                    aiResponse.records_retrieved,
                                    " record",
                                    aiResponse.records_retrieved !== 1 ? 's' : '',
                                    " found"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 22,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    aiResponse.generated_sql && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                className: "cursor-pointer text-sm text-muted-foreground hover:text-foreground",
                                children: "View generated SQL query"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "mt-2 p-3 bg-muted/50 rounded text-xs overflow-x-auto border border-border",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    children: aiResponse.generated_sql
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                    lineNumber: 34,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border border-border rounded-lg overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "bg-muted/30",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: columns.map((column)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border",
                                            children: column.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase())
                                        }, column, false, {
                                            fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                            lineNumber: 47,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                    lineNumber: 45,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: results.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                                        children: columns.map((column)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-sm text-foreground border-b border-border/50",
                                                children: row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'
                                            }, column, false, {
                                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                                lineNumber: 60,
                                                columnNumber: 21
                                            }, this))
                                    }, index, false, {
                                        fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                        lineNumber: 58,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/sqlresulttable.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/Drishti/reliability-chart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>ReliabilityChart
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
'use client';
;
;
function ReliabilityChart({ toolCalls }) {
    const getReliabilityChartData = (toolCalls)=>{
        if (!toolCalls || !Array.isArray(toolCalls)) return null;
        const reliabilityTool = toolCalls.find((tool)=>tool.name === 'get_component_reliability');
        if (!reliabilityTool || !reliabilityTool.result) return null;
        const result = reliabilityTool.result;
        // Handle single component result
        if (result.data && result.data.reliability_score !== undefined) {
            return [
                {
                    name: result.data.nomenclature || result.data.component_name || 'Component',
                    reliability: (result.data.reliability_score * 100).toFixed(2),
                    ship: result.data.ship
                }
            ];
        }
        // Handle multiple component results
        if (result.data && result.data.results && Array.isArray(result.data.results)) {
            return result.data.results.filter((item)=>item.reliability !== null && item.reliability !== undefined).map((item)=>({
                    name: `${item.nomenclature || 'Unknown'} (${item.ship || 'Unknown Ship'})`,
                    reliability: (item.reliability * 100).toFixed(2),
                    ship: item.ship || 'Unknown Ship'
                }));
        }
        return null;
    };
    const CustomTooltip = ({ active, payload, label })=>{
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border border-border rounded-lg p-3 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-medium",
                        children: `${label}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                        lineNumber: 52,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-primary",
                        children: `Reliability: ${data.reliability}%`
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                        lineNumber: 53,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: `Ship: ${data.ship}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                        lineNumber: 56,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                lineNumber: 51,
                columnNumber: 17
            }, this);
        }
        return null;
    };
    const chartData = getReliabilityChartData(toolCalls);
    if (!chartData || chartData.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: " rounded-lg border border-border p-4 bg-white",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-black font-semibold mb-4",
                    children: [
                        "Reliability Distribution ",
                        toolCalls.duration_hours
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                    lineNumber: 72,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                    width: "100%",
                    height: 300,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BarChart"], {
                        data: chartData,
                        margin: {
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                strokeDasharray: "3 3",
                                className: "stroke-border"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 85,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
                                dataKey: "name",
                                className: "text-muted-foreground",
                                tick: {
                                    fontSize: 12
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 86,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
                                className: "text-muted-foreground",
                                tick: {
                                    fontSize: 12
                                },
                                label: {
                                    value: 'Reliability (%)',
                                    angle: -90,
                                    position: 'insideLeft'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 91,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomTooltip, {}, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                    lineNumber: 96,
                                    columnNumber: 43
                                }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 96,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Legend"], {}, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 97,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bar"], {
                                dataKey: "reliability",
                                name: "Equipment",
                                fill: "#25547e",
                                radius: [
                                    4,
                                    4,
                                    0,
                                    0
                                ]
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                                lineNumber: 98,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                        lineNumber: 76,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                    lineNumber: 75,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-3 text-sm text-muted-foreground",
                    children: "* Reliability scores are shown as percentages. Higher values indicate better reliability."
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
                    lineNumber: 106,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
            lineNumber: 71,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/reliability-chart.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/registry/new-york-v4/ui/badge.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Badge": ()=>Badge,
    "badgeVariants": ()=>badgeVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-auto', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
            secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
            destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
            outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : 'span';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/badge.tsx",
        lineNumber: 34,
        columnNumber: 12
    }, this);
}
;
}),
"[project]/src/components/Drishti/flow-diagram.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ReactFlowHierarchy": ()=>ReactFlowHierarchy
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-ssr] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-ssr] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/card.tsx [app-ssr] (ecmascript)");
// React Flow imports
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
// Custom React Flow Node Component - Fixed version from second code
const ComponentNode = ({ data, selected })=>{
    const getNodeIcon = (componentName)=>{
        const name = componentName.toLowerCase();
        if (name.includes("pump")) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 36,
            columnNumber: 43
        }, ("TURBOPACK compile-time value", void 0));
        if (name.includes("motor")) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 37,
            columnNumber: 44
        }, ("TURBOPACK compile-time value", void 0));
        if (name.includes("turbine")) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 38,
            columnNumber: 46
        }, ("TURBOPACK compile-time value", void 0));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 39,
            columnNumber: 16
        }, ("TURBOPACK compile-time value", void 0));
    };
    const getNodeColor = (level, isRoot)=>{
        if (isRoot) return "from-blue-500 to-blue-600";
        if (level === 1) return "from-green-500 to-green-600";
        if (level === 2) return "from-purple-500 to-purple-600";
        return "from-gray-500 to-gray-600";
    };
    const getReliabilityColor = (reliability)=>{
        if (!reliability) return "text-gray-300";
        if (reliability >= 90) return "text-green-200";
        if (reliability >= 80) return "text-yellow-200";
        return "text-red-200";
    };
    const getReliabilityBgColor = (reliability)=>{
        if (!reliability) return "bg-gray-600";
        if (reliability >= 90) return "bg-green-600";
        if (reliability >= 80) return "bg-yellow-600";
        return "bg-red-600";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 65,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
          px-4 py-3 rounded-lg shadow-lg border-2 transition-all duration-200
          ${selected ? "border-blue-400 shadow-blue-200" : "border-gray-200"}
          hover:scale-105 hover:shadow-xl
          bg-gradient-to-br ${getNodeColor(data.level, data.isRoot)} text-white
          min-w-[160px] max-w-[220px]
        `,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-2",
                        children: [
                            getNodeIcon(data.component_name),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-semibold text-sm truncate flex-1",
                                children: [
                                    data.component_name,
                                    " (",
                                    data.nomenclature,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 79,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            data.isRoot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "secondary",
                                className: "text-xs px-1 py-0",
                                children: "ROOT"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 81,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 77,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    (data.ship_name || data.department_id) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs opacity-80 mb-2 space-y-1",
                        children: data.ship_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "truncate",
                            children: [
                                "Ship: ",
                                data.ship_name
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 90,
                            columnNumber: 44
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 89,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    data.reliability !== undefined && data.reliability !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 pt-2 border-t border-white/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs font-medium mb-1 opacity-90",
                                children: "Reliability"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 97,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `text-lg font-bold ${getReliabilityColor(data.reliability)}`,
                                    children: [
                                        data.reliability.toFixed(4),
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                    lineNumber: 99,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 98,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 96,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 pt-2 border-t border-white/20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-center opacity-60",
                            children: "No reliability data"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 106,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 105,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-xs opacity-60 text-center",
                        children: [
                            "Level ",
                            data.level,
                            " • ",
                            data.duration || "30d"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 67,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
// Add this function to fetch reliability data (fixed for numeric duration)
const fetchComponentReliability = async (componentId, duration)=>{
    try {
        const params = new URLSearchParams({
            duration: duration
        });
        const response = await fetch(`http://127.0.0.1:8000/reliability/${componentId}?${params}`);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", response.status, errorData);
            return null;
        }
        const data = await response.json();
        // Backend returns a float directly
        return typeof data === 'number' ? data : data.reliability || null;
    } catch (error) {
        console.error("Error fetching reliability data:", error);
        return null;
    }
};
// Enhanced function to recursively fetch reliability for hierarchy
const fetchReliabilityForHierarchy = async (hierarchy, duration)=>{
    // Fetch reliability for current component
    const reliabilityData = await fetchComponentReliability(hierarchy.component_id, duration);
    const componentWithReliability = {
        ...hierarchy,
        reliability: reliabilityData
    };
    // Recursively fetch reliability for children
    if (componentWithReliability.children && componentWithReliability.children.length > 0) {
        const childrenWithReliability = await Promise.all(componentWithReliability.children.map(async (child)=>{
            return await fetchReliabilityForHierarchy(child, duration);
        }));
        componentWithReliability.children = childrenWithReliability;
    }
    return componentWithReliability;
};
function ReactFlowHierarchy({ hierarchyData, duration }) {
    const [hierarchyWithReliability, setHierarchyWithReliability] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoadingReliability, setIsLoadingReliability] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Fetch reliability data when component mounts or duration changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadReliabilityData = async ()=>{
            setIsLoadingReliability(true);
            try {
                const durationValue = duration ? duration.toString() : "30";
                const hierarchyWithRel = await fetchReliabilityForHierarchy(hierarchyData, durationValue);
                setHierarchyWithReliability(hierarchyWithRel);
            } catch (error) {
                console.error('Error loading reliability data:', error);
                setHierarchyWithReliability(hierarchyData); // Fallback to original data
            } finally{
                setIsLoadingReliability(false);
            }
        };
        loadReliabilityData();
    }, [
        hierarchyData,
        duration
    ]);
    // Use hierarchyWithReliability for flow generation
    const { nodes: initialNodes, edges: initialEdges } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!hierarchyWithReliability) return {
            nodes: [],
            edges: []
        };
        const durationValue = duration ? duration.toString() : "30";
        return convertHierarchyToFlow(hierarchyWithReliability, durationValue);
    }, [
        hierarchyWithReliability,
        duration
    ]);
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(initialEdges);
    // Update nodes when initialNodes change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [
        initialNodes,
        initialEdges,
        setNodes,
        setEdges
    ]);
    // Handle escape key to exit fullscreen
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleEscKey = (event)=>{
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        return ()=>document.removeEventListener('keydown', handleEscKey);
    }, [
        isFullscreen
    ]);
    const nodeTypes = {
        component: ComponentNode
    };
    const durationString = duration ? `${duration} hours` : "30 hours";
    const toggleFullscreen = ()=>{
        setIsFullscreen(!isFullscreen);
    };
    if (isLoadingReliability) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
            className: "mt-4 h-[600px]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 236,
                                columnNumber: 25
                            }, this),
                            "Component Hierarchy - ",
                            hierarchyData.ship_name,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "outline",
                                children: [
                                    "Duration: ",
                                    durationString
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 238,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 235,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                    lineNumber: 234,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "h-[500px] flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "h-6 w-6 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 243,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Loading reliability data..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 244,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                        lineNumber: 242,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                    lineNumber: 241,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 233,
            columnNumber: 13
        }, this);
    }
    const cardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: isFullscreen ? "p-4" : "",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                    lineNumber: 256,
                                    columnNumber: 25
                                }, this),
                                "Component Hierarchy - ",
                                hierarchyData.ship_name,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    children: [
                                        "Duration: ",
                                        durationString
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                    lineNumber: 258,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 255,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: toggleFullscreen,
                            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
                            title: isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen",
                            children: isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "⤡"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 266,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "⛶"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                                lineNumber: 268,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 260,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                    lineNumber: 254,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 253,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: `p-0 ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
                    nodes: nodes,
                    edges: edges,
                    onNodesChange: onNodesChange,
                    onEdgesChange: onEdgesChange,
                    nodeTypes: nodeTypes,
                    fitView: true,
                    fitViewOptions: {
                        padding: 0.2
                    },
                    defaultViewport: {
                        x: 0,
                        y: 0,
                        zoom: 0.8
                    },
                    className: "bg-gray-50",
                    nodesDraggable: true,
                    nodesConnectable: false,
                    elementsSelectable: true,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {
                            color: "#e2e8f0",
                            gap: 20
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 288,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                            className: "bg-white border border-gray-200 rounded-lg shadow-lg",
                            showInteractive: false
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                            lineNumber: 289,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                    lineNumber: 274,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 273,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
    if (isFullscreen) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 bg-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "w-full h-full border-none shadow-none",
                children: cardContent
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
                lineNumber: 298,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
            lineNumber: 297,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
        className: "w-full mt-4 h-[600px]",
        children: cardContent
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/flow-diagram.tsx",
        lineNumber: 306,
        columnNumber: 9
    }, this);
}
// Also update the convertHierarchyToFlow function to handle reliability properly
const convertHierarchyToFlow = (hierarchy, duration = "30")=>{
    const nodes = [];
    const edges = [];
    const processNode = (component, x, y, level, isRoot = false)=>{
        const nodeData = {
            component_id: component.component_id,
            component_name: component.component_name,
            nomenclature: component.nomenclature,
            ship_name: 'ship_name' in component ? component.ship_name : undefined,
            department_id: 'department_id' in component ? component.department_id : undefined,
            level,
            isRoot,
            reliability: component.reliability,
            duration
        };
        nodes.push({
            id: component.component_id,
            type: "component",
            position: {
                x,
                y
            },
            data: nodeData
        });
        if (component.children && component.children.length > 0) {
            const childrenCount = component.children.length;
            const childSpacing = 220;
            const startX = x - (childrenCount - 1) * childSpacing / 2;
            component.children.forEach((child, index)=>{
                const childX = startX + index * childSpacing;
                const childY = y + 150;
                edges.push({
                    id: `${component.component_id}-${child.component_id}`,
                    source: component.component_id,
                    target: child.component_id,
                    type: "smoothstep",
                    animated: true,
                    style: {
                        stroke: "#64748b",
                        strokeWidth: 2
                    },
                    markerEnd: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MarkerType"].ArrowClosed,
                        color: "#64748b"
                    }
                });
                processNode(child, childX, childY, level + 1);
            });
        }
    };
    processNode(hierarchy, 0, 0, 0, true);
    return {
        nodes,
        edges
    };
};
}),
"[project]/src/components/Drishti/messages.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>Message
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-ssr] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$sqlresulttable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/sqlresulttable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$reliability$2d$chart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/reliability-chart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$flow$2d$diagram$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/flow-diagram.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function Message({ message, index }) {
    console.log("01215", message);
    const hasReliabilityToolCall = (toolCalls)=>{
        if (!toolCalls || !Array.isArray(toolCalls)) return false;
        return toolCalls.some((tool)=>tool.name === 'get_component_reliability');
    };
    const hasSQLResponse = (aiResponse)=>{
        return !!(aiResponse && aiResponse.result && aiResponse.result.length > 0);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`,
        children: [
            message.role === 'assistant' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                className: "w-8 h-8 mt-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/messages.tsx",
                    lineNumber: 29,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/messages.tsx",
                lineNumber: 28,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `rounded-lg p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : message.isError ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-muted'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "whitespace-pre-wrap",
                                children: message.content
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                lineNumber: 40,
                                columnNumber: 21
                            }, this),
                            message.role === 'assistant' && message.hierarchy_data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$flow$2d$diagram$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReactFlowHierarchy"], {
                                hierarchyData: message.hierarchy_data,
                                duration: message.duration
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                lineNumber: 44,
                                columnNumber: 25
                            }, this),
                            message.role === 'assistant' && hasSQLResponse(message.ai_response) && message.ai_response && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$sqlresulttable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                aiResponse: message.ai_response
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                lineNumber: 52,
                                columnNumber: 25
                            }, this),
                            message.role === 'assistant' && hasReliabilityToolCall(message.tool_calls) && message.tool_calls && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$reliability$2d$chart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                toolCalls: message.tool_calls
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                lineNumber: 57,
                                columnNumber: 25
                            }, this),
                            message.tool_calls && message.tool_calls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 pt-4 border-t border-border/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-muted-foreground mb-2",
                                        children: "Tool calls:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/messages.tsx",
                                        lineNumber: 63,
                                        columnNumber: 29
                                    }, this),
                                    message.tool_calls.map((tool, toolIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-background/50 rounded p-3 mb-2 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-foreground",
                                                    children: tool.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/messages.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-muted-foreground mt-1",
                                                    children: [
                                                        "Arguments: ",
                                                        JSON.stringify(tool.arguments, null, 2)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Drishti/messages.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 37
                                                }, this),
                                                tool.result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-muted-foreground mt-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                        className: "cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                className: "hover:text-foreground",
                                                                children: "View result"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                                                lineNumber: 73,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                className: "mt-2 text-xs overflow-x-auto bg-background/80 p-2 rounded",
                                                                children: JSON.stringify(tool.result, null, 2)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                                                lineNumber: 74,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/Drishti/messages.tsx",
                                                        lineNumber: 72,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/messages.tsx",
                                                    lineNumber: 71,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, toolIndex, true, {
                                            fileName: "[project]/src/components/Drishti/messages.tsx",
                                            lineNumber: 65,
                                            columnNumber: 33
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/messages.tsx",
                                lineNumber: 62,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/messages.tsx",
                        lineNumber: 34,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-muted-foreground mt-1 px-4",
                        children: new Date(message.timestamp).toLocaleTimeString()
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/messages.tsx",
                        lineNumber: 86,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/messages.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            message.role === 'user' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                className: "w-8 h-8 mt-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                    className: "w-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/messages.tsx",
                    lineNumber: 93,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/messages.tsx",
                lineNumber: 92,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/messages.tsx",
        lineNumber: 26,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/Drishti/welcome.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>WelcomeScreen
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-ssr] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
;
;
;
function WelcomeScreen({ onQuickAction }) {
    const quickActions = [
        {
            icon: "🚢",
            title: "Component Hierarchy",
            action: "@ship_name=INS ONE, nomenclature=GT 1"
        },
        {
            icon: "📊",
            title: "Reliability Analysis",
            action: "@ship_name=INS ONE, nomenclature=GT 1, duration=40"
        },
        {
            icon: "🔍",
            title: "Search Components",
            action: "Show me all components for INS ONE"
        },
        {
            icon: "💻",
            title: "Write code",
            action: "Write Python code to analyze data"
        }
    ];
    const handleQuickAction = (action)=>{
        if (onQuickAction) {
            onQuickAction(action);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 flex items-center justify-center p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-2xl w-full text-center space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center shadow-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                className: "w-10 h-10 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/welcome.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-normal text-5xl font-bold text-white tracking-tight",
                            children: "Welcome to Netra"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3 max-w-2xl mx-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "py-1 font-normal bg-muted/80 rounded-2xl text-lg text-white leading-relaxed",
                                    children: "Get started by asking about component hierarchy, reliability analysis, or any other task."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                                    lineNumber: 50,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-300",
                                    children: [
                                        "Use: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "bg-gray-700 px-2 py-1 rounded",
                                            children: "@ship_name=SHIP_NAME, nomenclature=NOMENCLATURE, duration=HOURS"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                                            lineNumber: 54,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-4 max-w-lg mx-auto",
                    children: quickActions.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            className: "h-16 flex items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground border-border bg-card/70",
                            onClick: ()=>handleQuickAction(item.action),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 bg-accent rounded-full flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-accent-foreground",
                                                children: item.icon
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/welcome.tsx",
                                                lineNumber: 69,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: item.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "w-4 h-4 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/src/components/Drishti/welcome.tsx",
                            lineNumber: 61,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/welcome.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/welcome.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/welcome.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/Drishti/chat-main.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>ChatMain
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-debounce.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-ssr] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$messages$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/messages.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$welcome$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/welcome.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
function ChatMain({ ships = [], toggleRightSidebar }) {
    // Consolidated state
    const [chatState, setChatState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        messages: [],
        isLoading: false,
        error: null,
        retryCount: 0
    });
    // Input and autocomplete state
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [showAutocomplete, setShowAutocomplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autocompletePosition, setAutocompletePosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(-1);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autocompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const abortControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Debounced search query
    const debouncedSearchQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebounce"])(searchQuery, 200);
    // Memoized filtered ships with fuzzy search
    const filteredShips = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fuzzySearch"])(debouncedSearchQuery, ships);
    }, [
        debouncedSearchQuery,
        ships
    ]);
    // Parse message for hierarchy request
    const parseHierarchyRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>{
        const shipNameMatch = message.match(/@ship_name=([^,@]+)/i);
        const nomenclatureMatch = message.match(/nomenclature=([^,@]+)/i);
        const durationMatch = message.match(/duration=(\d+(?:\.\d+)?)/i);
        if (shipNameMatch && nomenclatureMatch) {
            return {
                shipName: shipNameMatch[1].trim(),
                nomenclature: nomenclatureMatch[1].trim(),
                duration: durationMatch ? parseFloat(durationMatch[1]) : undefined
            };
        }
        return null;
    }, []);
    // Fetch component hierarchy
    const fetchHierarchy = async (shipName, nomenclature)=>{
        const encodedShipName = encodeURIComponent(shipName);
        const encodedNomenclature = encodeURIComponent(nomenclature);
        const response = await fetch(`http://127.0.0.1:8000/components/hierarchy?nomenclature=${encodedNomenclature}&ship_name=${encodedShipName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch hierarchy: ${response.status} ${response.statusText}`);
        }
        return response.json();
    };
    // Extract ship names from the message
    const extractShipNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>{
        const shipNamePattern = /@ship_name=([^@\s,]+(?:\s+[^@\s,]*)*)/g;
        const matches = [];
        let match;
        while((match = shipNamePattern.exec(message)) !== null){
            const shipNamesString = match[1].trim();
            const shipNames = shipNamesString.split(',').map((name)=>name.trim()).filter((name)=>name.length > 0);
            matches.push(...shipNames);
        }
        return [
            ...new Set(matches)
        ];
    }, []);
    // Send message function with hierarchy support
    const sendMessage = async ()=>{
        if (!inputValue.trim() || chatState.isLoading) return;
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const userMessage = {
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };
        setChatState((prev)=>({
                ...prev,
                messages: [
                    ...prev.messages,
                    userMessage
                ],
                isLoading: true,
                error: null
            }));
        const messageToSend = inputValue.trim();
        const hierarchyRequest = parseHierarchyRequest(messageToSend);
        setInputValue("");
        setShowAutocomplete(false);
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        try {
            let assistantMessage;
            // Handle hierarchy request
            if (hierarchyRequest) {
                try {
                    const hierarchyData = await fetchHierarchy(hierarchyRequest.shipName, hierarchyRequest.nomenclature);
                    assistantMessage = {
                        role: "assistant",
                        content: `Component hierarchy for ${hierarchyRequest.nomenclature} on ${hierarchyRequest.shipName}${hierarchyRequest.duration ? ` with reliability analysis for ${hierarchyRequest.duration} hours` : ''}:`,
                        timestamp: new Date().toISOString(),
                        hierarchy_data: hierarchyData,
                        duration: hierarchyRequest.duration
                    };
                } catch (hierarchyError) {
                    console.error('Error fetching hierarchy:', hierarchyError);
                    assistantMessage = {
                        role: "assistant",
                        content: `Failed to fetch component hierarchy: ${hierarchyError instanceof Error ? hierarchyError.message : 'Unknown error'}`,
                        timestamp: new Date().toISOString(),
                        isError: true
                    };
                }
            } else {
                // Handle regular chat request
                const extractedShips = extractShipNames(messageToSend);
                const requestBody = {
                    message: messageToSend,
                    conversation_history: chatState.messages,
                    filters: {
                        ships: extractedShips,
                        explain: false
                    }
                };
                const response = await fetch('http://127.0.0.1:8000/chat/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal: abortControllerRef.current.signal
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                assistantMessage = {
                    role: "assistant",
                    content: data.response,
                    timestamp: data.timestamp,
                    tool_calls: data.tool_calls,
                    duration: data.duration_hours,
                    ai_response: data.ai_response
                };
            }
            setChatState((prev)=>({
                    ...prev,
                    messages: [
                        ...prev.messages,
                        assistantMessage
                    ],
                    isLoading: false,
                    retryCount: 0
                }));
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return; // Request was cancelled, don't update state
            }
            console.error('Error sending message:', error);
            const errorMessage = {
                role: "assistant",
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date().toISOString(),
                isError: true
            };
            setChatState((prev)=>({
                    ...prev,
                    messages: [
                        ...prev.messages,
                        errorMessage
                    ],
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    retryCount: prev.retryCount + 1
                }));
        }
    };
    // Handle input changes and autocomplete logic
    const handleInputChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const value = e.target.value;
        setInputValue(value);
        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const shipNameMatch = textBeforeCursor.match(/@ship_name=([^@]*?)([^@,\s]*)$/);
        if (shipNameMatch) {
            const searchTerm = shipNameMatch[2];
            setSearchQuery(searchTerm);
            const input = inputRef.current;
            if (input) {
                const rect = input.getBoundingClientRect();
                setAutocompletePosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX
                });
            }
            setShowAutocomplete(true);
            setSelectedIndex(-1);
        } else {
            setShowAutocomplete(false);
            setSearchQuery("");
        }
    }, []);
    // Handle ship selection
    const selectShip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((ship)=>{
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeCursor = inputValue.substring(0, cursorPosition);
        const textAfterCursor = inputValue.substring(cursorPosition);
        const newText = textBeforeCursor.replace(/@ship_name=([^@]*?)([^@,\s]*)$/, (match, existingShips, currentSearch)=>{
            const prefix = existingShips.trim() ? existingShips + ', ' : '';
            return `@ship_name=${prefix}${ship.ship_name}`;
        }) + textAfterCursor;
        setInputValue(newText);
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        setSearchQuery("");
        setTimeout(()=>{
            inputRef.current?.focus();
            const newCursorPosition = newText.length - textAfterCursor.length;
            inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }, [
        inputValue
    ]);
    // Handle keyboard navigation
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (!showAutocomplete) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            return;
        }
        switch(e.key){
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev)=>prev < filteredShips.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev)=>prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
                    selectShip(filteredShips[selectedIndex]);
                } else if (!e.shiftKey) {
                    sendMessage();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowAutocomplete(false);
                setSelectedIndex(-1);
                break;
            case 'Tab':
                if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
                    e.preventDefault();
                    selectShip(filteredShips[selectedIndex]);
                }
                break;
        }
    }, [
        showAutocomplete,
        selectedIndex,
        filteredShips,
        selectShip,
        sendMessage
    ]);
    // Close autocomplete when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
                setShowAutocomplete(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Handle quick actions from welcome screen
    const handleQuickAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((action)=>{
        setInputValue(action);
        // Focus the input after setting the value
        setTimeout(()=>{
            inputRef.current?.focus();
        }, 0);
    }, []);
    // Cleanup abort controller on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChatErrorBoundary"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-muted/30 rounded-xl border border-white/80 shadow-lg shadow-[0_3px_10px_rgba(0,0,0,0.2)] rounded-[10px] flex-1 flex flex-col relative ml-4 mr-4 mb-5 mt-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AutocompleteDropdown"], {
                    show: showAutocomplete,
                    ships: filteredShips,
                    position: autocompletePosition,
                    selectedIndex: selectedIndex,
                    onSelect: selectShip,
                    onMouseEnter: setSelectedIndex,
                    forwardRef: autocompleteRef
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-main.tsx",
                    lineNumber: 353,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col overflow-hidden",
                    children: chatState.messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$welcome$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        onQuickAction: handleQuickAction
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/chat-main.tsx",
                        lineNumber: 366,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-4xl mx-auto space-y-6",
                            children: [
                                chatState.messages.map((message, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$messages$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        message: message,
                                        index: index
                                    }, index, false, {
                                        fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                        lineNumber: 371,
                                        columnNumber: 19
                                    }, this)),
                                chatState.isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-4 justify-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "w-8 h-8 mt-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                                lineNumber: 377,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                            lineNumber: 376,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-muted rounded-lg p-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-4 h-4 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                                        lineNumber: 381,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-muted-foreground",
                                                        children: "Thinking..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                                lineNumber: 380,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                            lineNumber: 379,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/chat-main.tsx",
                                    lineNumber: 375,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/chat-main.tsx",
                            lineNumber: 369,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/chat-main.tsx",
                        lineNumber: 368,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-main.tsx",
                    lineNumber: 364,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    toggleRightSidebar: toggleRightSidebar,
                    inputValue: inputValue,
                    onChange: handleInputChange,
                    onKeyDown: handleKeyDown,
                    onSend: sendMessage,
                    isLoading: chatState.isLoading,
                    forwardRef: inputRef
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-main.tsx",
                    lineNumber: 393,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/chat-main.tsx",
            lineNumber: 351,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/chat-main.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/Drishti/left-sidebar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>Leftsidebar
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/telescope.js [app-ssr] (ecmascript) <export default as Telescope>");
;
;
;
;
;
function Leftsidebar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " w-64 rounded-md bg-gradient-to-b from-[#9BA0AC]/60 to-[#1a1d25]/60 border-r  flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-4 p-4 border-b ",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-start items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__["Telescope"], {
                            className: "w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                            placeholder: "Search",
                            className: "pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-4 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "default",
                        className: "w-full justify-start gap-3 bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            "Documents",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-1 border-t border-sidebar-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-medium text-muted-foreground mb-2",
                        children: "Settings & Help"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-sidebar-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                            className: "w-8 h-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                    src: "/placeholder.svg?height=32&width=32"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarFallback"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-medium text-sidebar-foreground",
                                    children: "Jhon Doe"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
"[project]/src/components/Drishti/right-sidebar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
// Mock data structure based on your JSON
const mockData = {
    "ships": [
        {
            "reactflow": {
                "nodes": [
                    {
                        "id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "type": "bidirectional",
                        "position": {
                            "x": 400,
                            "y": 50
                        },
                        "data": {
                            "label": "INS TWO",
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
                        "id": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "system_type_SystemType.SUPPORT",
                        "type": "bidirectional",
                        "position": {
                            "x": 400,
                            "y": 600
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
                        "id": "system_type_SystemType.PROPULSION",
                        "type": "bidirectional",
                        "position": {
                            "x": 150,
                            "y": 350.00000000000006
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
                        "id": "a6c18eee-afed-40b2-85f2-461686f53261",
                        "type": "bidirectional",
                        "position": {
                            "x": 300,
                            "y": 350.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                        "type": "bidirectional",
                        "position": {
                            "x": 150,
                            "y": 500.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                        "type": "bidirectional",
                        "position": {
                            "x": 0,
                            "y": 350.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
                        "type": "bidirectional",
                        "position": {
                            "x": 149.99999999999997,
                            "y": 200.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "61b4a105-493a-41d0-83e6-0edae33280a1",
                        "type": "bidirectional",
                        "position": {
                            "x": 550,
                            "y": 100
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                        "type": "bidirectional",
                        "position": {
                            "x": 399.99999999999994,
                            "y": 250
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                        "type": "bidirectional",
                        "position": {
                            "x": 249.99999999999994,
                            "y": 100.00000000000001
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                        "type": "bidirectional",
                        "position": {
                            "x": 399.99999999999994,
                            "y": -50
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                        "type": "bidirectional",
                        "position": {
                            "x": 550,
                            "y": 600
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
                        "type": "bidirectional",
                        "position": {
                            "x": 475,
                            "y": 729.9038105676658
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                        "type": "bidirectional",
                        "position": {
                            "x": 325,
                            "y": 729.9038105676658
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                        "type": "bidirectional",
                        "position": {
                            "x": 250,
                            "y": 600
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                        "type": "bidirectional",
                        "position": {
                            "x": 324.99999999999994,
                            "y": 470.09618943233426
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "416ac6d7-f67a-4099-9846-ebfac0513203",
                        "type": "bidirectional",
                        "position": {
                            "x": 475,
                            "y": 470.0961894323342
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "ca0d1566-48ef-4581-a791-09372008a868",
                        "type": "bidirectional",
                        "position": {
                            "x": 800,
                            "y": 350
                        },
                        "data": {
                            "label": "Missile",
                            "component_id": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "dc9919f7-2841-4379-b3c5-7ea801255417",
                        "type": "bidirectional",
                        "position": {
                            "x": 500,
                            "y": 350
                        },
                        "data": {
                            "label": "Super Rapid Gun Mount",
                            "component_id": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                        "id": "ship-fdc1f9a0-d380-42bb-9ee5-7990a46ddff5-to-systems",
                        "source": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "systems-to-ship-fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "target": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-a6c18eee-afed-40b2-85f2-461686f53261",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "component-a6c18eee-afed-40b2-85f2-461686f53261-to-systemtype-SystemType.PROPULSION",
                        "source": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-684cd682-dd7c-4e4d-8be6-a272308f57f3",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "component-684cd682-dd7c-4e4d-8be6-a272308f57f3-to-systemtype-SystemType.PROPULSION",
                        "source": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "component-67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc-to-systemtype-SystemType.PROPULSION",
                        "source": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-dd283800-f8a5-427b-8139-b9f4a8b5a257",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "component-dd283800-f8a5-427b-8139-b9f4a8b5a257-to-systemtype-SystemType.PROPULSION",
                        "source": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-61b4a105-493a-41d0-83e6-0edae33280a1",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "component-61b4a105-493a-41d0-83e6-0edae33280a1-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "component-73c81f0b-5c0f-4203-84eb-95bc0af1eeb8-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "component-12d52b50-48b9-4b53-a4ee-9dd850f62f02-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "component-20b19ac3-ba09-44a7-8b28-b20feb5b844e-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "component-f82d1c8e-a33d-4392-b1a6-1b38fe193123-to-systemtype-SystemType.SUPPORT",
                        "source": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-e3b3f310-a782-46dd-afc7-2e225f370a85",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "component-e3b3f310-a782-46dd-afc7-2e225f370a85-to-systemtype-SystemType.SUPPORT",
                        "source": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "component-8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf-to-systemtype-SystemType.SUPPORT",
                        "source": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "component-9f805558-6cd0-40c0-8ee2-511bca7e1c4f-to-systemtype-SystemType.SUPPORT",
                        "source": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "component-09ec6833-f241-4eb8-ad1e-b0d524281c0b-to-systemtype-SystemType.SUPPORT",
                        "source": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-416ac6d7-f67a-4099-9846-ebfac0513203",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "component-416ac6d7-f67a-4099-9846-ebfac0513203-to-systemtype-SystemType.SUPPORT",
                        "source": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "systemtype-SystemType.FIRING-to-component-ca0d1566-48ef-4581-a791-09372008a868",
                        "source": "system_type_SystemType.FIRING",
                        "target": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "component-ca0d1566-48ef-4581-a791-09372008a868-to-systemtype-SystemType.FIRING",
                        "source": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "systemtype-SystemType.FIRING-to-component-dc9919f7-2841-4379-b3c5-7ea801255417",
                        "source": "system_type_SystemType.FIRING",
                        "target": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                        "id": "component-dc9919f7-2841-4379-b3c5-7ea801255417-to-systemtype-SystemType.FIRING",
                        "source": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                    "ship_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                    "ship_name": "INS TWO",
                    "total_nodes": 22,
                    "total_edges": 42,
                    "hierarchy": {
                        "ships": 1,
                        "systems": 1,
                        "system_types": 4,
                        "components": 16
                    }
                }
            },
            "ship_name": {
                "ship_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                "ship_name": "INS TWO",
                "ship_category": "DESTROYER AND FRIGATES",
                "ship_class": "KOLKATA (P-15A)",
                "total_systems": 4,
                "has_systems": [
                    "64044bde-5b46-4ab3-b44d-2d140833284b",
                    "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                    "6b3a59eb-4cc2-4480-b512-9357aed35540",
                    "a2b3e95b-c3b8-43ce-af79-eb445794f7ab"
                ],
                "systems": [
                    {
                        "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
                        "system_type": "propulsion",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 4,
                        "root_components_count": 4,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "a6c18eee-afed-40b2-85f2-461686f53261",
                            "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                            "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                            "dd283800-f8a5-427b-8139-b9f4a8b5a257"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "a6c18eee-afed-40b2-85f2-461686f53261",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.843000",
                                "modified_date": "2025-07-14T09:54:15.843000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.833000",
                                "modified_date": "2025-07-14T09:54:15.833000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.853000",
                                "modified_date": "2025-07-14T09:54:15.853000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.823000",
                                "modified_date": "2025-07-14T09:54:15.823000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                        "system_type": "power_generation",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 4,
                        "root_components_count": 4,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "61b4a105-493a-41d0-83e6-0edae33280a1",
                            "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                            "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                            "20b19ac3-ba09-44a7-8b28-b20feb5b844e"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "61b4a105-493a-41d0-83e6-0edae33280a1",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.860000",
                                "modified_date": "2025-07-14T09:54:15.860000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.873000",
                                "modified_date": "2025-07-14T09:54:15.873000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.880000",
                                "modified_date": "2025-07-14T09:54:15.880000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.887000",
                                "modified_date": "2025-07-14T09:54:15.887000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                        "system_type": "support",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 6,
                        "root_components_count": 6,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                            "e3b3f310-a782-46dd-afc7-2e225f370a85",
                            "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                            "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                            "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                            "416ac6d7-f67a-4099-9846-ebfac0513203"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 6",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.903000",
                                "modified_date": "2025-07-14T09:54:15.903000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.813000",
                                "modified_date": "2025-07-14T09:54:15.813000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 5",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.897000",
                                "modified_date": "2025-07-14T09:54:15.897000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.723000",
                                "modified_date": "2025-07-14T09:54:15.723000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.793000",
                                "modified_date": "2025-07-14T09:54:15.793000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "416ac6d7-f67a-4099-9846-ebfac0513203",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.803000",
                                "modified_date": "2025-07-14T09:54:15.803000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                        "system_type": "firing",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 2,
                        "root_components_count": 2,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "ca0d1566-48ef-4581-a791-09372008a868",
                            "dc9919f7-2841-4379-b3c5-7ea801255417"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "ca0d1566-48ef-4581-a791-09372008a868",
                                "component_name": "Missile",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "BrahMos",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.920000",
                                "modified_date": "2025-07-14T09:54:15.920000",
                                "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "dc9919f7-2841-4379-b3c5-7ea801255417",
                                "component_name": "Super Rapid Gun Mount",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "SRGM 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.910000",
                                "modified_date": "2025-07-14T09:54:15.910000",
                                "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    }
                ]
            }
        },
        {
            "reactflow": {
                "nodes": [
                    {
                        "id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "type": "bidirectional",
                        "position": {
                            "x": 400,
                            "y": 50
                        },
                        "data": {
                            "label": "INS TWO",
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
                        "id": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "system_type_SystemType.SUPPORT",
                        "type": "bidirectional",
                        "position": {
                            "x": 400,
                            "y": 600
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
                        "id": "system_type_SystemType.PROPULSION",
                        "type": "bidirectional",
                        "position": {
                            "x": 150,
                            "y": 350.00000000000006
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
                        "id": "a6c18eee-afed-40b2-85f2-461686f53261",
                        "type": "bidirectional",
                        "position": {
                            "x": 300,
                            "y": 350.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                        "type": "bidirectional",
                        "position": {
                            "x": 150,
                            "y": 500.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                        "type": "bidirectional",
                        "position": {
                            "x": 0,
                            "y": 350.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
                        "type": "bidirectional",
                        "position": {
                            "x": 149.99999999999997,
                            "y": 200.00000000000006
                        },
                        "data": {
                            "label": "Gas Turbine",
                            "component_id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "61b4a105-493a-41d0-83e6-0edae33280a1",
                        "type": "bidirectional",
                        "position": {
                            "x": 550,
                            "y": 100
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                        "type": "bidirectional",
                        "position": {
                            "x": 399.99999999999994,
                            "y": 250
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                        "type": "bidirectional",
                        "position": {
                            "x": 249.99999999999994,
                            "y": 100.00000000000001
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                        "type": "bidirectional",
                        "position": {
                            "x": 399.99999999999994,
                            "y": -50
                        },
                        "data": {
                            "label": "Generator",
                            "component_id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                        "type": "bidirectional",
                        "position": {
                            "x": 550,
                            "y": 600
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
                        "type": "bidirectional",
                        "position": {
                            "x": 475,
                            "y": 729.9038105676658
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                        "type": "bidirectional",
                        "position": {
                            "x": 325,
                            "y": 729.9038105676658
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                        "type": "bidirectional",
                        "position": {
                            "x": 250,
                            "y": 600
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                        "type": "bidirectional",
                        "position": {
                            "x": 324.99999999999994,
                            "y": 470.09618943233426
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "416ac6d7-f67a-4099-9846-ebfac0513203",
                        "type": "bidirectional",
                        "position": {
                            "x": 475,
                            "y": 470.0961894323342
                        },
                        "data": {
                            "label": "Air Conditioner",
                            "component_id": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "ca0d1566-48ef-4581-a791-09372008a868",
                        "type": "bidirectional",
                        "position": {
                            "x": 800,
                            "y": 350
                        },
                        "data": {
                            "label": "Missile",
                            "component_id": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "dc9919f7-2841-4379-b3c5-7ea801255417",
                        "type": "bidirectional",
                        "position": {
                            "x": 500,
                            "y": 350
                        },
                        "data": {
                            "label": "Super Rapid Gun Mount",
                            "component_id": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                        "id": "ship-fdc1f9a0-d380-42bb-9ee5-7990a46ddff5-to-systems",
                        "source": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "systems-to-ship-fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "target": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "source": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "target": "systems_collective_fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-a6c18eee-afed-40b2-85f2-461686f53261",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "component-a6c18eee-afed-40b2-85f2-461686f53261-to-systemtype-SystemType.PROPULSION",
                        "source": "a6c18eee-afed-40b2-85f2-461686f53261",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-684cd682-dd7c-4e4d-8be6-a272308f57f3",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "component-684cd682-dd7c-4e4d-8be6-a272308f57f3-to-systemtype-SystemType.PROPULSION",
                        "source": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "component-67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc-to-systemtype-SystemType.PROPULSION",
                        "source": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
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
                        "id": "systemtype-SystemType.PROPULSION-to-component-dd283800-f8a5-427b-8139-b9f4a8b5a257",
                        "source": "system_type_SystemType.PROPULSION",
                        "target": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "component-dd283800-f8a5-427b-8139-b9f4a8b5a257-to-systemtype-SystemType.PROPULSION",
                        "source": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-61b4a105-493a-41d0-83e6-0edae33280a1",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "component-61b4a105-493a-41d0-83e6-0edae33280a1-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "61b4a105-493a-41d0-83e6-0edae33280a1",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "component-73c81f0b-5c0f-4203-84eb-95bc0af1eeb8-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "component-12d52b50-48b9-4b53-a4ee-9dd850f62f02-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
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
                        "id": "systemtype-SystemType.POWER_GENERATION-to-component-20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                        "source": "system_type_SystemType.POWER_GENERATION",
                        "target": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "component-20b19ac3-ba09-44a7-8b28-b20feb5b844e-to-systemtype-SystemType.POWER_GENERATION",
                        "source": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "component-f82d1c8e-a33d-4392-b1a6-1b38fe193123-to-systemtype-SystemType.SUPPORT",
                        "source": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-e3b3f310-a782-46dd-afc7-2e225f370a85",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "component-e3b3f310-a782-46dd-afc7-2e225f370a85-to-systemtype-SystemType.SUPPORT",
                        "source": "e3b3f310-a782-46dd-afc7-2e225f370a85",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "component-8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf-to-systemtype-SystemType.SUPPORT",
                        "source": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "component-9f805558-6cd0-40c0-8ee2-511bca7e1c4f-to-systemtype-SystemType.SUPPORT",
                        "source": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "component-09ec6833-f241-4eb8-ad1e-b0d524281c0b-to-systemtype-SystemType.SUPPORT",
                        "source": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
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
                        "id": "systemtype-SystemType.SUPPORT-to-component-416ac6d7-f67a-4099-9846-ebfac0513203",
                        "source": "system_type_SystemType.SUPPORT",
                        "target": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "component-416ac6d7-f67a-4099-9846-ebfac0513203-to-systemtype-SystemType.SUPPORT",
                        "source": "416ac6d7-f67a-4099-9846-ebfac0513203",
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
                        "id": "systemtype-SystemType.FIRING-to-component-ca0d1566-48ef-4581-a791-09372008a868",
                        "source": "system_type_SystemType.FIRING",
                        "target": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "component-ca0d1566-48ef-4581-a791-09372008a868-to-systemtype-SystemType.FIRING",
                        "source": "ca0d1566-48ef-4581-a791-09372008a868",
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
                        "id": "systemtype-SystemType.FIRING-to-component-dc9919f7-2841-4379-b3c5-7ea801255417",
                        "source": "system_type_SystemType.FIRING",
                        "target": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                        "id": "component-dc9919f7-2841-4379-b3c5-7ea801255417-to-systemtype-SystemType.FIRING",
                        "source": "dc9919f7-2841-4379-b3c5-7ea801255417",
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
                    "ship_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                    "ship_name": "INS TWO",
                    "total_nodes": 22,
                    "total_edges": 42,
                    "hierarchy": {
                        "ships": 1,
                        "systems": 1,
                        "system_types": 4,
                        "components": 16
                    }
                }
            },
            "ship_name": {
                "ship_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                "ship_name": "INS TWO",
                "ship_category": "DESTROYER AND FRIGATES",
                "ship_class": "KOLKATA (P-15A)",
                "total_systems": 4,
                "has_systems": [
                    "64044bde-5b46-4ab3-b44d-2d140833284b",
                    "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                    "6b3a59eb-4cc2-4480-b512-9357aed35540",
                    "a2b3e95b-c3b8-43ce-af79-eb445794f7ab"
                ],
                "systems": [
                    {
                        "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
                        "system_type": "propulsion",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 4,
                        "root_components_count": 4,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "a6c18eee-afed-40b2-85f2-461686f53261",
                            "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                            "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                            "dd283800-f8a5-427b-8139-b9f4a8b5a257"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "a6c18eee-afed-40b2-85f2-461686f53261",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.843000",
                                "modified_date": "2025-07-14T09:54:15.843000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "684cd682-dd7c-4e4d-8be6-a272308f57f3",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.833000",
                                "modified_date": "2025-07-14T09:54:15.833000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "67a003b8-60c2-4cd1-92d1-b0f1c4ff9fcc",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.853000",
                                "modified_date": "2025-07-14T09:54:15.853000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "dd283800-f8a5-427b-8139-b9f4a8b5a257",
                                "component_name": "Gas Turbine",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GT 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.823000",
                                "modified_date": "2025-07-14T09:54:15.823000",
                                "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                        "system_type": "power_generation",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 4,
                        "root_components_count": 4,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "61b4a105-493a-41d0-83e6-0edae33280a1",
                            "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                            "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                            "20b19ac3-ba09-44a7-8b28-b20feb5b844e"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "61b4a105-493a-41d0-83e6-0edae33280a1",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.860000",
                                "modified_date": "2025-07-14T09:54:15.860000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "73c81f0b-5c0f-4203-84eb-95bc0af1eeb8",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.873000",
                                "modified_date": "2025-07-14T09:54:15.873000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "12d52b50-48b9-4b53-a4ee-9dd850f62f02",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.880000",
                                "modified_date": "2025-07-14T09:54:15.880000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "20b19ac3-ba09-44a7-8b28-b20feb5b844e",
                                "component_name": "Generator",
                                "department_id": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff9",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "GTG 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.887000",
                                "modified_date": "2025-07-14T09:54:15.887000",
                                "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                        "system_type": "support",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 6,
                        "root_components_count": 6,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                            "e3b3f310-a782-46dd-afc7-2e225f370a85",
                            "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                            "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                            "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                            "416ac6d7-f67a-4099-9846-ebfac0513203"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "f82d1c8e-a33d-4392-b1a6-1b38fe193123",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 6",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.903000",
                                "modified_date": "2025-07-14T09:54:15.903000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "e3b3f310-a782-46dd-afc7-2e225f370a85",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 4",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.813000",
                                "modified_date": "2025-07-14T09:54:15.813000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "8fb9aeb8-4f73-42b9-8ef3-309a4587ccdf",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 5",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.897000",
                                "modified_date": "2025-07-14T09:54:15.897000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "9f805558-6cd0-40c0-8ee2-511bca7e1c4f",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.723000",
                                "modified_date": "2025-07-14T09:54:15.723000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "09ec6833-f241-4eb8-ad1e-b0d524281c0b",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 2",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.793000",
                                "modified_date": "2025-07-14T09:54:15.793000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "416ac6d7-f67a-4099-9846-ebfac0513203",
                                "component_name": "Air Conditioner",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "AC 3",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.803000",
                                "modified_date": "2025-07-14T09:54:15.803000",
                                "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                        "system_type": "firing",
                        "created_date": "2025-07-30T15:29:54.093000",
                        "total_components": 2,
                        "root_components_count": 2,
                        "belongs_to_ship": "fdc1f9a0-d380-42bb-9ee5-7990a46ddff5",
                        "has_components": [
                            "ca0d1566-48ef-4581-a791-09372008a868",
                            "dc9919f7-2841-4379-b3c5-7ea801255417"
                        ],
                        "system_type_shared_with_systems": [],
                        "components": [
                            {
                                "component_id": "ca0d1566-48ef-4581-a791-09372008a868",
                                "component_name": "Missile",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "BrahMos",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.920000",
                                "modified_date": "2025-07-14T09:54:15.920000",
                                "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            },
                            {
                                "component_id": "dc9919f7-2841-4379-b3c5-7ea801255417",
                                "component_name": "Super Rapid Gun Mount",
                                "department_id": "b8b7a8df-2ccc-462c-b7a2-1e5bbe0161f6",
                                "parent_id": null,
                                "CMMS_EquipmentCode": null,
                                "is_lmu": 1,
                                "parent_name": null,
                                "nomenclature": "SRGM 1",
                                "etl": false,
                                "created_date": "2025-07-14T09:54:15.910000",
                                "modified_date": "2025-07-14T09:54:15.910000",
                                "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                                "has_children": [],
                                "is_child_of": null,
                                "has_descendants": [],
                                "is_root_component": true,
                                "child_count": 0,
                                "descendant_count": 0,
                                "children": []
                            }
                        ]
                    }
                ]
            }
        }
    ]
};
// Custom expandable node component
const ExpandableNode = ({ data, id })=>{
    const handleExpand = (event)=>{
        event.stopPropagation();
        if (data.onExpand) {
            data.onExpand(data.shipIndex, !data.isExpanded);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `px-6 py-4 rounded-lg border-2 min-w-[150px] text-center cursor-pointer transition-all shadow-lg ${data.isShipRoot ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-800 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105' : data.nodeType === 'system' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-700' : data.nodeType === 'equipment' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-700' : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 hover:from-gray-200 hover:to-gray-300'}`,
        onClick: data.isShipRoot ? handleExpand : undefined,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-bold text-lg",
                children: data.label
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3624,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            data.isShipRoot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm mt-2 opacity-90",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: data.isExpanded ? '🔼' : '🔽'
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3628,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: data.isExpanded ? 'Click to collapse' : 'Click to expand'
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3629,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                        lineNumber: 3627,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 text-xs bg-white/20 rounded px-2 py-1 inline-block",
                        children: [
                            data.nodeCount,
                            " components"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                        lineNumber: 3631,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3626,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            data.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs mt-2 opacity-80",
                children: data.description
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3637,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
        lineNumber: 3612,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const nodeTypes = {
    expandable: ExpandableNode
};
// Layout algorithm for hierarchical positioning
const getLayoutedElements = (nodes, edges, direction = 'TB')=>{
    const isHorizontal = direction === 'LR';
    // Find root nodes (ship nodes)
    const shipNodes = nodes.filter((node)=>node.data?.isShipRoot);
    const detailNodes = nodes.filter((node)=>!node.data?.isShipRoot);
    // Position ship nodes in a row
    const shipSpacing = 400;
    const layoutedShipNodes = shipNodes.map((node, index)=>({
            ...node,
            position: {
                x: index * shipSpacing,
                y: 0
            },
            targetPosition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top,
            sourcePosition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom
        }));
    // Position detail nodes below their respective ships
    const layoutedDetailNodes = detailNodes.map((node)=>{
        const shipIndex = node.data?.shipIndex || 0;
        const baseX = shipIndex * shipSpacing;
        // Get all detail nodes for this ship
        const shipDetailNodes = detailNodes.filter((n)=>n.data?.shipIndex === shipIndex);
        const nodeIndex = shipDetailNodes.findIndex((n)=>n.id === node.id);
        // Create a grid layout for detail nodes
        const nodesPerRow = 3;
        const nodeSpacing = 180;
        const rowSpacing = 120;
        const row = Math.floor(nodeIndex / nodesPerRow);
        const col = nodeIndex % nodesPerRow;
        // Center the nodes under the ship
        const totalWidth = Math.min(shipDetailNodes.length, nodesPerRow) * nodeSpacing;
        const startX = baseX - totalWidth / 2 + nodeSpacing / 2;
        return {
            ...node,
            position: {
                x: startX + col * nodeSpacing,
                y: 200 + row * rowSpacing
            },
            targetPosition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top,
            sourcePosition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom
        };
    });
    return {
        nodes: [
            ...layoutedShipNodes,
            ...layoutedDetailNodes
        ],
        edges
    };
};
// Main component
const FleetDiagramsApp = ({ data = mockData })=>{
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])([]);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])([]);
    const [expandedShips, setExpandedShips] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const { fitView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    const ships = data?.ships || [];
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((params)=>setEdges((eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEdge"])(params, eds)), [
        setEdges
    ]);
    // Handle ship expansion/collapse
    const handleShipExpand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((shipIndex, isExpanding)=>{
        const newExpandedShips = new Set(expandedShips);
        if (isExpanding) {
            newExpandedShips.add(shipIndex);
        } else {
            newExpandedShips.delete(shipIndex);
        }
        setExpandedShips(newExpandedShips);
    }, [
        expandedShips
    ]);
    // Prepare nodes and edges for expandable view
    const prepareFleetData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!ships || ships.length === 0) return {
            nodes: [],
            edges: []
        };
        // Create ship root nodes
        const shipRootNodes = ships.map((ship, index)=>{
            const shipData = ship?.reactflow || {};
            const shipNodes = shipData.nodes || [];
            const isExpanded = expandedShips.has(index);
            return {
                id: `ship-root-${index}`,
                type: 'expandable',
                position: {
                    x: index * 400,
                    y: 0
                },
                data: {
                    label: shipData.metadata?.ship_name || `Ship ${index + 1}`,
                    isShipRoot: true,
                    isExpanded: isExpanded,
                    nodeCount: shipNodes.length,
                    onExpand: handleShipExpand,
                    shipIndex: index,
                    description: `${shipNodes.length} components`
                }
            };
        });
        // Add expanded ship details
        let allNodes = [
            ...shipRootNodes
        ];
        let allEdges = [];
        expandedShips.forEach((shipIndex)=>{
            const ship = ships[shipIndex];
            if (ship?.reactflow) {
                const shipData = ship.reactflow;
                const shipNodes = shipData.nodes || [];
                const shipEdges = shipData.edges || [];
                // Add ship detail nodes with original IDs
                const expandedNodes = shipNodes.map((node)=>({
                        ...node,
                        id: `expanded-${shipIndex}-${node.id}`,
                        type: 'expandable',
                        data: {
                            ...node.data,
                            isShipRoot: false,
                            shipIndex: shipIndex,
                            nodeType: getNodeType(node.data?.label || ''),
                            description: `Ship: ${shipData.metadata?.ship_name || `Ship ${shipIndex + 1}`}`
                        }
                    }));
                // Add ship internal edges
                const internalEdges = shipEdges.map((edge)=>({
                        ...edge,
                        id: `expanded-${shipIndex}-${edge.id}`,
                        source: `expanded-${shipIndex}-${edge.source}`,
                        target: `expanded-${shipIndex}-${edge.target}`,
                        style: {
                            stroke: '#64748b',
                            strokeWidth: 2,
                            strokeDasharray: '5,5'
                        }
                    }));
                // Add connection from ship root to detail nodes
                const connectionEdges = shipNodes.map((node)=>({
                        id: `connection-${shipIndex}-${node.id}`,
                        source: `ship-root-${shipIndex}`,
                        target: `expanded-${shipIndex}-${node.id}`,
                        type: 'smoothstep',
                        style: {
                            stroke: '#3b82f6',
                            strokeWidth: 3,
                            opacity: 0.6
                        },
                        animated: true
                    }));
                allNodes = [
                    ...allNodes,
                    ...expandedNodes
                ];
                allEdges = [
                    ...allEdges,
                    ...internalEdges,
                    ...connectionEdges
                ];
            }
        });
        return {
            nodes: allNodes,
            edges: allEdges
        };
    }, [
        ships,
        expandedShips,
        handleShipExpand
    ]);
    // Determine node type for styling
    const getNodeType = (label)=>{
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('system') || lowerLabel.includes('control')) return 'system';
        if (lowerLabel.includes('generator') || lowerLabel.includes('engine') || lowerLabel.includes('turbine')) return 'equipment';
        return 'component';
    };
    // Layout and update
    const onLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((direction)=>{
        const fleetData = prepareFleetData();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(fleetData.nodes, fleetData.edges, direction);
        setNodes([
            ...layoutedNodes
        ]);
        setEdges([
            ...layoutedEdges
        ]);
        setTimeout(()=>{
            fitView({
                padding: 0.2
            });
        }, 100);
    }, [
        prepareFleetData,
        setNodes,
        setEdges,
        fitView
    ]);
    // Initialize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (ships.length > 0) {
            const fleetData = prepareFleetData();
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(fleetData.nodes, fleetData.edges, 'TB');
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setTimeout(()=>{
                fitView({
                    padding: 0.2
                });
            }, 100);
        }
    }, [
        ships,
        expandedShips,
        prepareFleetData,
        setNodes,
        setEdges,
        fitView
    ]);
    if (!ships || ships.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-screen bg-gray-100",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-700 mb-2",
                        children: "No Fleet Data Available"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                        lineNumber: 3869,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "Please provide ship data to visualize the fleet."
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                        lineNumber: 3870,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3868,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
            lineNumber: 3867,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold",
                                children: "🚢 Fleet Command Center"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3882,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-300 mt-1",
                                children: [
                                    "Ships: ",
                                    ships.length,
                                    " | Active Nodes: ",
                                    nodes.length,
                                    " | Connections: ",
                                    edges.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3883,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3 mt-2",
                                children: ships.map((ship, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `px-3 py-1 rounded-full text-xs font-medium transition-colors ${expandedShips.has(index) ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`,
                                        children: [
                                            ship?.reactflow?.metadata?.ship_name || `Ship ${index + 1}`,
                                            expandedShips.has(index) && ' ✓'
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                        lineNumber: 3888,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3886,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                        lineNumber: 3881,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                    lineNumber: 3880,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3879,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
                    nodes: nodes,
                    edges: edges,
                    onNodesChange: onNodesChange,
                    onEdgesChange: onEdgesChange,
                    onConnect: onConnect,
                    nodeTypes: nodeTypes,
                    fitView: true,
                    attributionPosition: "bottom-left",
                    connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
                    minZoom: 0.1,
                    maxZoom: 1.5,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                            position: "top-left"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                            lineNumber: 3920,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {
                            variant: "dots",
                            gap: 20,
                            size: 1
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                            lineNumber: 3921,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MiniMap"], {
                            position: "bottom-right",
                            nodeColor: (node)=>{
                                if (node.data?.isShipRoot) return '#2563eb';
                                if (node.data?.nodeType === 'system') return '#059669';
                                if (node.data?.nodeType === 'equipment') return '#7c3aed';
                                return '#6b7280';
                            },
                            nodeStrokeWidth: 2,
                            zoomable: true,
                            pannable: true
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                            lineNumber: 3922,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Panel"], {
                            position: "top-right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-4 rounded-lg shadow-xl border border-gray-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-bold mb-3 text-gray-800",
                                        children: "🎛️ Controls"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                        lineNumber: 3936,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onLayout('TB'),
                                                className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-medium",
                                                children: "📋 Top-Bottom Layout"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3938,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onLayout('LR'),
                                                className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors font-medium",
                                                children: "↔️ Left-Right Layout"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3944,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                        lineNumber: 3937,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-3 border-t border-gray-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-600 mb-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "💡 How to use:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                    lineNumber: 3953,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3952,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "text-xs text-gray-600 space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "🖱️ Click ship nodes to expand"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3956,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "🔍 Use minimap to navigate"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3957,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "⚙️ Drag nodes to reposition"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3958,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3955,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                        lineNumber: 3951,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-3 border-t border-gray-200 mt-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-600 mb-1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Legend:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                    lineNumber: 3963,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3962,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-3 h-3 bg-blue-600 rounded"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3967,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Ships"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3968,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3966,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-3 h-3 bg-green-500 rounded"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3971,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Systems"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3972,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3970,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-3 h-3 bg-purple-500 rounded"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3975,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Equipment"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                                lineNumber: 3976,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                        lineNumber: 3974,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                                lineNumber: 3965,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                        lineNumber: 3961,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                                lineNumber: 3935,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                            lineNumber: 3934,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                    lineNumber: 3907,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                lineNumber: 3906,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
        lineNumber: 3877,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = FleetDiagramsApp;
}),
"[project]/src/components/Drishti/chat-layout.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>ChatLayout
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-main.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$left$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/left-sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$right$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/right-sidebar.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ChatLayout({ ships }) {
    const [showRightSidebar, setShowRightSidebar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$left$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-layout.tsx",
                lineNumber: 17,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                ships: ships,
                toggleRightSidebar: ()=>setShowRightSidebar(!showRightSidebar),
                showRightSidebar: showRightSidebar
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/chat-layout.tsx",
                lineNumber: 19,
                columnNumber: 13
            }, this),
            showRightSidebar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$right$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
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
}),

};

//# sourceMappingURL=src_76c9dde0._.js.map