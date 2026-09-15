import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";

import api from "../services/api";

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                {
                    username,
                    password,
                }
            );

            const {
                token,
                username: loggedInUsername,
                role,
            } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem(
                "username",
                loggedInUsername
            );
            localStorage.setItem("role", role);

            navigate("/", { replace: true });

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Invalid username or password"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                padding: 2,
            }}
        >

            <Card
                sx={{
                    width: "100%",
                    maxWidth: 420,
                }}
            >

                <CardContent sx={{ padding: 4 }}>

                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                    >
                        ERP Login
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Sign in to access the ERP system
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleLogin}
                    >

                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            margin="normal"
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                />
                            ) : (
                                "Login"
                            )}
                        </Button>

                    </Box>

                </CardContent>

            </Card>

        </Box>
    );
}