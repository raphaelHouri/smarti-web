"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Gift } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

/** Home content for `/admin` CRM — quick links to Next.js admin pages outside the react-admin router. */
export default function AdminDashboardHome() {
    return (
        <Box sx={{ p: 2, maxWidth: 640 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                מרכז ניהול Smarti
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                קישורים מהירים למסכים שמחוץ לתפריט הרגיל.
            </Typography>
            <Card
                sx={{
                    mb: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: 4,
                }}
            >
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2,
                                    bgcolor: "rgba(255,255,255,0.2)",
                                }}
                            >
                                <Gift size={24} strokeWidth={2} aria-hidden />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    הענקת מנוי
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    הענקה או הארכת מנוי למשתמש לפי אימייל — ללא תשלום
                                </Typography>
                            </Box>
                        </Stack>
                        <Button
                            component={RouterLink}
                            to="/grant-subscription"
                            variant="contained"
                            size="large"
                            sx={{
                                alignSelf: "flex-start",
                                bgcolor: "common.white",
                                color: "primary.main",
                                fontWeight: 700,
                                px: 3,
                                "&:hover": {
                                    bgcolor: "grey.100",
                                },
                            }}
                        >
                            פתח הענקת מנוי
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
