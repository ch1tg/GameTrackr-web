import {
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { type SearchedUser } from '../api/search.service';

interface UserCardProps {
    user: SearchedUser;
}

export default function UserCard({ user }: UserCardProps) {
    const navigate = useNavigate();

    const avatarLetter = user.username[0]?.toUpperCase() || '?';
    const avatarPlaceholderUrl = `https://placehold.co/150/e0e0e0/333?text=${avatarLetter}`;

    const handleCardClick = () => {
        navigate(`/users/${user.username}`);
    };

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
                    pt: 3
                }}
            >
                <CardMedia
                    component="img"
                    image={avatarPlaceholderUrl}
                    alt="Avatar Placeholder"
                    sx={{
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        border: '4px solid',
                        borderColor: 'divider'
                    }}
                />

                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        pb: 2
                    }}
                >
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {user.username}
                    </Typography>
                </CardContent>

            </CardActionArea>
        </Card>
    );
}