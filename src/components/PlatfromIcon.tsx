import { Box } from '@mui/material';

import pcIcon from '../assets/icons/pc.svg?url';
import playstationIcon from '../assets/icons/playstation.svg?url';
import xboxIcon from '../assets/icons/xbox.svg?url';
import nintendoIcon from '../assets/icons/nintendo.svg?url';
import macOs from '../assets/icons/macos.svg?url';
import linuxIcon from '../assets/icons/linux.svg?url';
import webIcon from '../assets/icons/web.svg?url';

interface PlatformIconProps {
    slug: string;
}

const iconMap: Record<string, string> = {
    pc: pcIcon,
    playstation: playstationIcon,
    xbox: xboxIcon,
    nintendo: nintendoIcon,
    mac: macOs,
    linux: linuxIcon,
    web: webIcon,
};

export default function PlatformIcon({ slug }: PlatformIconProps) {

    const iconUrl = iconMap[slug] || iconMap.web;
    return (
        <Box
            component="img"
            src={iconUrl}
            alt={slug}
            sx={{
                width: 16,
                height: 16,
                display: 'block',
                filter: 'grayscale(1) opacity(0.7)',
                transition: 'filter 0.2s',
                '&:hover': {
                    filter: 'grayscale(0) opacity(1)'
                }
            }}
        />
    );
}