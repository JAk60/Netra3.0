module.exports = {

"[project]/src/actions/entity.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// actions/ships.ts
/* __next_internal_action_entry_do_not_use__ [{"40e4890d7b913d1f1c1bdcecfafd7e54861443cc0e":"getShips"},"",""] */ __turbopack_context__.s({
    "getShips": ()=>getShips
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
async function getShips({ skip = 0, limit = 100 } = {}) {
    try {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });
        const response = await fetch(`http://localhost:8000/ships?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ships: ${response.status} ${response.statusText}`);
        }
        const ships = await response.json();
        return ships;
    } catch (error) {
        console.error('Error fetching ships:', error);
        throw new Error('Failed to fetch ships');
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getShips
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getShips, "40e4890d7b913d1f1c1bdcecfafd7e54861443cc0e", null);
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/entity.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/entity.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/entity.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/entity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/entity.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/entity.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "40e4890d7b913d1f1c1bdcecfafd7e54861443cc0e": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getShips"]
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/entity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/entity.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/entity.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "40e4890d7b913d1f1c1bdcecfafd7e54861443cc0e": ()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["40e4890d7b913d1f1c1bdcecfafd7e54861443cc0e"]
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/entity.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/entity.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/Drishti/chat-main.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/Drishti/chat-main.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/Drishti/chat-main.tsx <module evaluation>", "default");
}),
"[project]/src/components/Drishti/chat-main.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/Drishti/chat-main.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/Drishti/chat-main.tsx", "default");
}),
"[project]/src/components/Drishti/chat-main.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-main.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-main.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Avatar": ()=>Avatar,
    "AvatarFallback": ()=>AvatarFallback,
    "AvatarImage": ()=>AvatarImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Avatar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Avatar() from the server but Avatar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx <module evaluation>", "Avatar");
const AvatarFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarFallback() from the server but AvatarFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx <module evaluation>", "AvatarFallback");
const AvatarImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarImage() from the server but AvatarImage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx <module evaluation>", "AvatarImage");
}),
"[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Avatar": ()=>Avatar,
    "AvatarFallback": ()=>AvatarFallback,
    "AvatarImage": ()=>AvatarImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Avatar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Avatar() from the server but Avatar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx", "Avatar");
const AvatarFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarFallback() from the server but AvatarFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx", "AvatarFallback");
const AvatarImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AvatarImage() from the server but AvatarImage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/registry/new-york-v4/ui/avatar.tsx", "AvatarImage");
}),
"[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/lib/utils.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "absoluteUrl": ()=>absoluteUrl,
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-rsc] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function absoluteUrl(path) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
}),
"[project]/src/registry/new-york-v4/ui/button.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-rsc] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
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
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
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
"[project]/src/registry/new-york-v4/ui/input.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Input": ()=>Input
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/registry/new-york-v4/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
;
}),
"[project]/src/components/Drishti/left-sidebar.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>Leftsidebar
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/avatar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/new-york-v4/ui/input.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-rsc] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-rsc] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-rsc] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-rsc] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-rsc] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-rsc] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-rsc] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/telescope.js [app-rsc] (ecmascript) <export default as Telescope>");
;
;
;
;
;
function Leftsidebar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " w-64 rounded-md bg-gradient-to-b from-[#9BA0AC]/60 to-[#1a1d25]/60 border-r  flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-4 p-4 border-b ",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-start items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$telescope$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Telescope$3e$__["Telescope"], {
                            className: "w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$input$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Input"], {
                            placeholder: "Search",
                            className: "pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-4 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "default",
                        className: "w-full justify-start gap-3 bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            "Documents",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-1 border-t border-sidebar-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-medium text-muted-foreground mb-2",
                        children: "Settings & Help"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        className: "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-sidebar-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Avatar"], {
                            className: "w-8 h-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                    src: "/placeholder.svg?height=32&width=32"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$new$2d$york$2d$v4$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AvatarFallback"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-medium text-sidebar-foreground",
                                    children: "Jhon Doe"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Drishti/left-sidebar.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
"[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>CustomEdge,
    "getSpecialPath": ()=>getSpecialPath
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-rsc] (ecmascript)");
;
;
const getSpecialPath = ({ sourceX, sourceY, targetX, targetY }, offsetX, offsetY)=>{
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    return `M ${sourceX} ${sourceY} Q ${centerX + offsetX} ${centerY + offsetY} ${targetX} ${targetY}`;
};
function CustomEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label }) {
    const { isBiDirectional, isFirstEdge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useStore"])((s)=>{
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
        [path, labelX, labelY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBezierPath"])(edgePathParams);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseEdge"], {
                path: path,
                markerEnd: markerEnd
            }, void 0, false, {
                fileName: "[project]/src/components/Drishti/BiDirectionalEdge.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EdgeLabelRenderer"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
"[project]/src/components/Drishti/BiDirectionalNode.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-rsc] (ecmascript)");
;
;
;
const BiDirectionalNode = ({ data })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Position"].Left,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Position"].Right,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Position"].Top,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Position"].Bottom,
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
const __TURBOPACK__default__export__ = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["memo"])(BiDirectionalNode);
}),
"[project]/src/components/Drishti/test.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalEdge.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/BiDirectionalNode.tsx [app-rsc] (ecmascript)");
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
            "id": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "type": "bidirectional",
            "position": {
                "x": 700,
                "y": 200
            },
            "data": {
                "label": "propulsion",
                "system_type": "propulsion",
                "created_date": "2025-07-30 15:29:54.093000",
                "total_components": 4,
                "root_components_count": 4,
                "node_type": "system"
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
            "id": "5358d044-9f4f-44cf-a975-341221f7189d",
            "type": "bidirectional",
            "position": {
                "x": 850,
                "y": 200
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
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
                "x": 700,
                "y": 350
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
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
                "x": 550,
                "y": 200.00000000000003
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
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
                "x": 700,
                "y": 50
            },
            "data": {
                "label": "Gas Turbine",
                "component_id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
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
            "id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "type": "bidirectional",
            "position": {
                "x": 400,
                "y": 500
            },
            "data": {
                "label": "power_generation",
                "system_type": "power_generation",
                "created_date": "2025-07-30 15:29:54.093000",
                "total_components": 4,
                "root_components_count": 4,
                "node_type": "system"
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
            "id": "443360a0-6218-486b-a34c-1813963177b7",
            "type": "bidirectional",
            "position": {
                "x": 550,
                "y": 500
            },
            "data": {
                "label": "Generator",
                "component_id": "443360a0-6218-486b-a34c-1813963177b7",
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
                "x": 400,
                "y": 650
            },
            "data": {
                "label": "Generator",
                "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
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
                "x": 250,
                "y": 500
            },
            "data": {
                "label": "Generator",
                "component_id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
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
                "x": 400,
                "y": 350
            },
            "data": {
                "label": "Generator",
                "component_id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
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
            "id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "position": {
                "x": 100,
                "y": 200.00000000000003
            },
            "data": {
                "label": "support",
                "system_type": "support",
                "created_date": "2025-07-30 15:29:54.093000",
                "total_components": 6,
                "root_components_count": 6,
                "node_type": "system"
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
            "id": "308804ec-bca2-45e9-b665-515de88ffa70",
            "type": "bidirectional",
            "position": {
                "x": 250,
                "y": 200.00000000000003
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
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
                "x": 175,
                "y": 329.9038105676658
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
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
                "x": 25.00000000000003,
                "y": 329.9038105676658
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
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
                "x": -50,
                "y": 200.00000000000006
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
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
                "x": 24.99999999999993,
                "y": 70.09618943233428
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
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
                "x": 175,
                "y": 70.09618943233423
            },
            "data": {
                "label": "Air Conditioner",
                "component_id": "d10aa05d-1f80-436d-b612-f52e28c44676",
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
            "id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "type": "bidirectional",
            "position": {
                "x": 399.99999999999994,
                "y": -100
            },
            "data": {
                "label": "firing",
                "system_type": "firing",
                "created_date": "2025-07-30 15:29:54.093000",
                "total_components": 2,
                "root_components_count": 2,
                "node_type": "system"
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
            "id": "1c16dacf-69cd-4061-b004-113d85948c61",
            "type": "bidirectional",
            "position": {
                "x": 550,
                "y": -100
            },
            "data": {
                "label": "Missile",
                "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
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
                "x": 249.99999999999994,
                "y": -99.99999999999999
            },
            "data": {
                "label": "Super Rapid Gun Mount",
                "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
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
            "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-system-64044bde-5b46-4ab3-b44d-2d140833284b",
            "source": "33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "64044bde-5b46-4ab3-b44d-2d140833284b",
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
            "id": "system-64044bde-5b46-4ab3-b44d-2d140833284b-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
            "source": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "target": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "installed_on_ship",
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
            "id": "system-64044bde-5b46-4ab3-b44d-2d140833284b-to-component-5358d044-9f4f-44cf-a975-341221f7189d",
            "source": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "target": "5358d044-9f4f-44cf-a975-341221f7189d",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-5358d044-9f4f-44cf-a975-341221f7189d-to-system-64044bde-5b46-4ab3-b44d-2d140833284b",
            "source": "5358d044-9f4f-44cf-a975-341221f7189d",
            "target": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-64044bde-5b46-4ab3-b44d-2d140833284b-to-component-ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "source": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "target": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-ab055ca1-2aa1-4c55-a1b1-39ead450a131-to-system-64044bde-5b46-4ab3-b44d-2d140833284b",
            "source": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
            "target": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-64044bde-5b46-4ab3-b44d-2d140833284b-to-component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "source": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "target": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e-to-system-64044bde-5b46-4ab3-b44d-2d140833284b",
            "source": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
            "target": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-64044bde-5b46-4ab3-b44d-2d140833284b-to-component-da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "source": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "target": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-da570729-9a1e-4fa1-8399-e21c93c46e8f-to-system-64044bde-5b46-4ab3-b44d-2d140833284b",
            "source": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
            "target": "64044bde-5b46-4ab3-b44d-2d140833284b",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-system-017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "source": "33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
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
            "id": "system-017bdf6b-d9f2-4f31-869d-842ad61a9627-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
            "source": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "target": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "installed_on_ship",
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
            "id": "system-017bdf6b-d9f2-4f31-869d-842ad61a9627-to-component-443360a0-6218-486b-a34c-1813963177b7",
            "source": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "target": "443360a0-6218-486b-a34c-1813963177b7",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-443360a0-6218-486b-a34c-1813963177b7-to-system-017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "source": "443360a0-6218-486b-a34c-1813963177b7",
            "target": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-017bdf6b-d9f2-4f31-869d-842ad61a9627-to-component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "source": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "target": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a-to-system-017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "source": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
            "target": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-017bdf6b-d9f2-4f31-869d-842ad61a9627-to-component-1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "source": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "target": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-1872dfb4-58f9-48d4-a713-953cd7e1048a-to-system-017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "source": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
            "target": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-017bdf6b-d9f2-4f31-869d-842ad61a9627-to-component-c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "source": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "target": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-c652b6b3-9d13-4e4d-833e-dd71aecd102b-to-system-017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "source": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
            "target": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "installed_on_ship",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-308804ec-bca2-45e9-b665-515de88ffa70",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "308804ec-bca2-45e9-b665-515de88ffa70",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-308804ec-bca2-45e9-b665-515de88ffa70-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "308804ec-bca2-45e9-b665-515de88ffa70",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-38093be3-acb7-40db-80ec-542dfc8d5d7d-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-73c2a73c-0e92-4742-9775-af95e89e1841",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "73c2a73c-0e92-4742-9775-af95e89e1841",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-73c2a73c-0e92-4742-9775-af95e89e1841-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "73c2a73c-0e92-4742-9775-af95e89e1841",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-6b3a59eb-4cc2-4480-b512-9357aed35540-to-component-d10aa05d-1f80-436d-b612-f52e28c44676",
            "source": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "target": "d10aa05d-1f80-436d-b612-f52e28c44676",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-d10aa05d-1f80-436d-b612-f52e28c44676-to-system-6b3a59eb-4cc2-4480-b512-9357aed35540",
            "source": "d10aa05d-1f80-436d-b612-f52e28c44676",
            "target": "6b3a59eb-4cc2-4480-b512-9357aed35540",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "source": "33f13701-849f-4030-8d71-a0f65eac992e",
            "target": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
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
            "id": "system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
            "source": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "target": "33f13701-849f-4030-8d71-a0f65eac992e",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "installed_on_ship",
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
            "id": "system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab-to-component-1c16dacf-69cd-4061-b004-113d85948c61",
            "source": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "target": "1c16dacf-69cd-4061-b004-113d85948c61",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-1c16dacf-69cd-4061-b004-113d85948c61-to-system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "source": "1c16dacf-69cd-4061-b004-113d85948c61",
            "target": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
            "id": "system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab-to-component-db30946a-2baf-49e4-9ceb-ec72365089b4",
            "source": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "target": "db30946a-2baf-49e4-9ceb-ec72365089b4",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "has_components",
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
            "id": "component-db30946a-2baf-49e4-9ceb-ec72365089b4-to-system-a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "source": "db30946a-2baf-49e4-9ceb-ec72365089b4",
            "target": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {
                "type": "ArrowClosed"
            },
            "label": "part_of_system_type",
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
        "total_nodes": 21,
        "total_edges": 40,
        "total_systems": 4
    }
};
const initialNodes = data.nodes;
const initialEdges = data.edges;
const edgeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalEdge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
};
const nodeTypes = {
    bidirectional: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$BiDirectionalNode$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
};
const EdgesFlow = ()=>{
    const [nodes, , onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useNodesState"])(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useEdgesState"])(initialEdges);
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["useCallback"])((params)=>setEdges((eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addEdge"])(params, eds)), []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: '100vh',
            width: '100%'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReactFlow"], {
            nodes: nodes,
            edges: edges,
            onNodesChange: onNodesChange,
            onEdgesChange: onEdgesChange,
            onConnect: onConnect,
            edgeTypes: edgeTypes,
            nodeTypes: nodeTypes,
            fitView: true,
            attributionPosition: "top-right",
            connectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConnectionMode"].Loose,
            isValidConnection: ({ sourceHandle, targetHandle })=>sourceHandle === 'bottom' && targetHandle === 'top',
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Controls"], {}, void 0, false, {
                    fileName: "[project]/src/components/Drishti/test.tsx",
                    lineNumber: 1349,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Background"], {}, void 0, false, {
                    fileName: "[project]/src/components/Drishti/test.tsx",
                    lineNumber: 1350,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/test.tsx",
            lineNumber: 1334,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/Drishti/test.tsx",
        lineNumber: 1333,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = EdgesFlow;
}),
"[project]/src/components/Drishti/home.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>ScriptClone
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$chat$2d$main$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/chat-main.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$left$2d$sidebar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/left-sidebar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$entity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/entity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$test$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/test.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
async function ScriptClone() {
    try {
        let authorized = false;
        if ("TURBOPACK compile-time truthy", 1) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$test$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/Drishti/home.tsx",
                lineNumber: 17,
                columnNumber: 9
            }, this);
        }
        //TURBOPACK unreachable
        ;
        const ships = undefined;
    } catch (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 text-center font-urbanist",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-red-500 mb-2",
                    children: "Failed to load ships"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/home.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-sm",
                    children: "Please try again later"
                }, void 0, false, {
                    fileName: "[project]/src/components/Drishti/home.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Drishti/home.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this);
    }
}
}),
"[project]/src/app/(delete-this-and-modify-page.tsx)/HomePage.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$home$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Drishti/home.tsx [app-rsc] (ecmascript)");
;
;
const HomePage = ()=>{
    return(// <main className='mx-auto mt-6 flex max-w-7xl flex-col justify-center gap-6 px-3 font-[family-name:var(--font-geist-sans)] sm:mt-3 sm:gap-12 sm:px-0'>
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Drishti$2f$home$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/(delete-this-and-modify-page.tsx)/HomePage.tsx",
        lineNumber: 6,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)));
};
const __TURBOPACK__default__export__ = HomePage;
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$delete$2d$this$2d$and$2d$modify$2d$page$2e$tsx$292f$HomePage$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(delete-this-and-modify-page.tsx)/HomePage.tsx [app-rsc] (ecmascript)");
;
;
/**
 * The main page component that renders the HomePage component.
 *
 * @returns {JSX.Element} The rendered HomePage component.
 */ const Page = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$delete$2d$this$2d$and$2d$modify$2d$page$2e$tsx$292f$HomePage$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 9,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Page;
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__b82184b1._.js.map