import {
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Box,
    Stack,
    IconButton
} from '@mui/material';
import { type Game } from '../api/game.service';
import PlatformIcon from './PlatfromIcon';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface GameCardProps {
    game: Game;
}

export default function GameCard({ game }: GameCardProps) {
    const navigate = useNavigate();

    const { user, wishlist, toggleWishlist, isWishlistLoading } = useAuth();


    const [isSubmitting, setIsSubmitting] = useState(false);

    const getMetacriticColor = (score: number | null) => {
        if (score === null) return 'default';
        if (score > 75) return 'success';
        if (score > 50) return 'warning';
        return 'error';
    };


    const handleToggleWishlist = async (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();


        if (isSubmitting || isWishlistLoading) return;

        setIsSubmitting(true);
        try {

            await toggleWishlist(game.id);
        } catch (error) {
            console.error("GameCard: Failed to toggle wishlist", error);

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/games/${game.id}`);
    };

    // Проверяем, в вишлисте ли игра?
    // 'wishlist' - это Set<number> из AuthContext
    const isInWishlist = wishlist.has(game.id);

    return (
        <Card
            elevation={3}
            sx={{
                height: 330,
                borderRadius: 2,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 8,
                },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CardActionArea
                onClick={handleCardClick}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <CardMedia
                    component="img"
                    image={game.background_image || 'https://placehold.co/600x400?text=No+Image'}
                    alt={game.name}
                    sx={{
                        objectFit: 'cover',
                        height: 180,
                        width: '100%',
                    }}
                />

                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={0.5}
                            mb={1}
                        >
                            {game.parent_platforms.map((p, i) => (
                                <PlatformIcon key={`${game.id}-${p}-${i}`} slug={p} />
                            ))}
                        </Stack>
                        <Typography
                            variant="h6"
                            component="div"
                            fontWeight="bold"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                mr: 1,
                            }}
                        >
                            {game.name}
                        </Typography>
                    </Box>

                    <Box
                        mt={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* Metacritic (без изменений) */}
                        {game.metacritic ? (
                            <Box>
                                <Chip
                                    label={game.metacritic}
                                    color={getMetacriticColor(game.metacritic)}
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                        ) : (
                            <Box />
                        )}

                        {user && (
                            <Box>
                                <IconButton
                                    aria-label="add to wishlist"
                                    onClick={handleToggleWishlist}
                                    disabled={isWishlistLoading || isSubmitting}
                                    size="small"
                                    sx={{
                                        color: 'gold',
                                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
                                    }}
                                >
                                    {isInWishlist ? (
                                        <StarIcon fontSize="small" />
                                    ) : (
                                        <StarBorderIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>

        </Card>
    );
}