"use client";

import * as React from "react";
import { Layout, Menu } from "react-admin";
import { BarChart3 } from "lucide-react";

function AdminSidebarMenu() {
    return (
        <Menu>
            <Menu.DashboardItem />
            <Menu.Item
                to="/learning-bi"
                primaryText="דשבורד BI לימוד"
                leftIcon={<BarChart3 size={22} strokeWidth={1.5} aria-hidden />}
            />
            <Menu.ResourceItems />
        </Menu>
    );
}

/** React-admin layout with BI link in the sidebar (runs inside `/admin` SPA). */
export function AdminAppLayout(props: React.ComponentProps<typeof Layout>) {
    return <Layout {...props} menu={AdminSidebarMenu} />;
}
