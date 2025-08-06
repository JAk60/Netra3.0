module.exports = {

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
function ChatInput({ setHideRightsidebar, inputValue, onChange, onKeyDown, onSend, isLoading, forwardRef }) {
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
                                    lineNumber: 167,
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
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                        lineNumber: 185,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mt-3 pt-3 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "ghost",
                                            size: "sm",
                                            className: "gap-2",
                                            disabled: isLoading,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__["EyeIcon"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                                    lineNumber: 193,
                                                    columnNumber: 17
                                                }, this),
                                                "Drishti"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                            lineNumber: 192,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "ghost",
                                            size: "sm",
                                            className: "gap-2",
                                            disabled: isLoading,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                                    lineNumber: 197,
                                                    columnNumber: 17
                                                }, this),
                                                "Browse Prompts"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                            lineNumber: 196,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                                    lineNumber: 191,
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
                                    lineNumber: 201,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Drishti/chat-input.tsx",
                            lineNumber: 190,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 165,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-muted-foreground text-center mt-3",
                    children: "etra may generate inaccurate information please confirm first"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/chat-input.tsx",
                    lineNumber: 207,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/chat-input.tsx",
            lineNumber: 164,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/chat-input.tsx",
        lineNumber: 163,
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
function ChatMain({ ships = [] }) {
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
"[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>CustomEdge,
    "getSpecialPath": ()=>getSpecialPath
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
;
;
const getSpecialPath = ({ sourceX, sourceY, targetX, targetY }, offsetX, offsetY)=>{
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    return `M ${sourceX} ${sourceY} Q ${centerX + offsetX} ${centerY + offsetY} ${targetX} ${targetY}`;
};
function CustomEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label }) {
    const { isBiDirectional, isFirstEdge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])((s)=>{
        // Check if there's a bidirectional connection
        const reverseEdge = s.edges.find((e)=>e.source === target && e.target === source);
        const isBiDirectional = !!reverseEdge;
        // Determine if this is the "first" edge (for consistent spacing)
        const isFirstEdge = !reverseEdge || reverseEdge && id < reverseEdge.id;
        return {
            isBiDirectional,
            isFirstEdge
        };
    });
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
        [path, labelX, labelY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBezierPath"])(edgePathParams);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseEdge"], {
                path: path,
                markerEnd: markerEnd
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalEdge.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EdgeLabelRenderer"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        color: 'black',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
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
}),
"[project]/src/components/Drishti/BiDirectionalNode.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
;
;
;
const BiDirectionalNode = ({ data })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left,
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
                lineNumber: 25,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right,
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
                lineNumber: 37,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top,
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
                lineNumber: 49,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom,
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
                lineNumber: 61,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            data?.label || 'Node'
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/BiDirectionalNode.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(BiDirectionalNode);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dagre/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalNode.tsx [app-ssr] (ecmascript)");
'use client';
;
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
const dagreGraph = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(()=>({}));
const nodeWidth = 272;
const nodeHeight = 180;
const getLayoutedElements = (nodes, edges, direction = 'TB')=>{
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
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].layout(dagreGraph);
    const layoutedNodes = nodes.map((node)=>{
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top,
            sourcePosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom,
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
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
const nodeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
const AutoLayoutFlow = ()=>{
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(initialEdges);
    const { fitView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((params)=>setEdges((eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEdge"])(params, eds)), [
        setEdges
    ]);
    const onLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((direction)=>{
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
        setNodes([
            ...layoutedNodes
        ]);
        setEdges([
            ...layoutedEdges
        ]);
        window.requestAnimationFrame(()=>{
            fitView();
        });
    }, [
        nodes,
        edges,
        setNodes,
        setEdges,
        fitView
    ]);
    // Auto-layout on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onLayout('LR');
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex border-white rounded-md bg-black/80 h-screen w-1/2 text-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
            nodes: nodes,
            edges: edges,
            onNodesChange: onNodesChange,
            onEdgesChange: onEdgesChange,
            onConnect: onConnect,
            nodeTypes: nodeTypes,
            edgeTypes: edgeTypes,
            fitView: true,
            attributionPosition: "top-right",
            connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {}, void 0, false, {
                    fileName: "[project]/src/components/Drishti/right-sidebar.tsx",
                    lineNumber: 1513,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {}, void 0, false, {
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
const __TURBOPACK__default__export__ = AutoLayoutFlow;
}),
"[project]/src/components/Drishti/test.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dagre/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalNode.tsx [app-ssr] (ecmascript)");
'use client';
;
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
const dagreGraph = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(()=>({}));
const nodeWidth = 272;
const nodeHeight = 180;
const getLayoutedElements = (nodes, edges, direction = 'TB')=>{
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
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dagre$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].layout(dagreGraph);
    const layoutedNodes = nodes.map((node)=>{
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Top,
            sourcePosition: isHorizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Bottom,
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
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
const nodeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
const AutoLayoutFlow = ()=>{
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(initialEdges);
    const { fitView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((params)=>setEdges((eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEdge"])(params, eds)), [
        setEdges
    ]);
    const onLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((direction)=>{
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
        setNodes([
            ...layoutedNodes
        ]);
        setEdges([
            ...layoutedEdges
        ]);
        window.requestAnimationFrame(()=>{
            fitView();
        });
    }, [
        nodes,
        edges,
        setNodes,
        setEdges,
        fitView
    ]);
    // Auto-layout on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onLayout('TB');
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex border-white rounded-md bg-black/50 h-screen w-1/2 text-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    justifyContent: "flex-end",
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 4,
                    display: 'flex',
                    gap: '10px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onLayout('TB'),
                        style: {
                            padding: '8px 16px',
                            background: '#1a365d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        },
                        children: "Vertical Layout"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/test.tsx",
                        lineNumber: 1481,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onLayout('LR'),
                        style: {
                            padding: '8px 16px',
                            background: '#1a365d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        },
                        children: "Horizontal Layout"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/test.tsx",
                        lineNumber: 1494,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/test.tsx",
                lineNumber: 1472,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
                nodes: nodes,
                edges: edges,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                onConnect: onConnect,
                nodeTypes: nodeTypes,
                edgeTypes: edgeTypes,
                fitView: true,
                attributionPosition: "top-right",
                connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {}, void 0, false, {
                        fileName: "[project]/src/components/Drishti/test.tsx",
                        lineNumber: 1521,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {}, void 0, false, {
                        fileName: "[project]/src/components/Drishti/test.tsx",
                        lineNumber: 1522,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Drishti/test.tsx",
                lineNumber: 1509,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Drishti/test.tsx",
        lineNumber: 1471,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = AutoLayoutFlow;
}),

};

//# sourceMappingURL=src_15435f94._.js.map