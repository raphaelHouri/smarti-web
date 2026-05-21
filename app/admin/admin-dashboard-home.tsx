"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/** Home content for `/admin` CRM — quick links to Next.js admin pages outside the react-admin router. */
export default function AdminDashboardHome() {
    return (
        <Box sx={{ p: 2, maxWidth: 560 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                מרכז ניהול Smarti
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                קישורים מהירים למסכים שמחוץ לתפריט הרגיל.
            </Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        אנליטיקה
                    </Typography>
                    <Stack spacing={1.5}>
                        <Link href="/admin/learning-bi" underline="hover" variant="body1" fontWeight={500}>
                            דשבורד BI לימוד
                        </Link>
                        <Typography variant="caption" color="text.secondary" display="block">
                            גם פריט בתפריט הצד לניווט פנימי; כאן מעבר דרך Next לבדיקת שרת.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
