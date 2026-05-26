"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { Layout, Menu } from "react-admin";
import { Gift } from "lucide-react";

function AdminSidebarMenu() {
    return (
        <Menu>
            <Menu.DashboardItem />
            <Box
                sx={{
                    mx: 1,
                    my: 1.5,
                    px: 0.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    boxShadow: 2,
                }}
            >
                <Menu.Item
                    to="/grant-subscription"
                    primaryText="הענקת מנוי"
                    leftIcon={<Gift size={24} strokeWidth={2} aria-hidden />}
                    sx={{
                        borderRadius: 1.5,
                        color: "primary.contrastText",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        "& .MuiListItemIcon-root": {
                            color: "primary.contrastText",
                            minWidth: 40,
                        },
                        "& .MuiTypography-root": {
                            fontWeight: 700,
                        },
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                        "&.RaMenuItemLink-active": {
                            bgcolor: "primary.dark",
                        },
                    }}
                />
            </Box>
            <Menu.ResourceItems />
        </Menu>
    );
}

/** React-admin layout with custom sidebar links (runs inside `/admin` SPA). */
export function AdminAppLayout(props: React.ComponentProps<typeof Layout>) {
    return <Layout {...props} menu={AdminSidebarMenu} />;
}
