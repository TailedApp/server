export enum ColorPosition {
    Foreground,
    Background
}

export enum Color {
    Default,
    Black,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    BrightBlack,
    BrightRed,
    BrightGreen,
    BrightYellow,
    BrightBlue,
    BrightMagenta,
    BrightCyan,
    BrightWhite
}

export const DefaultForeground = '\x1b[39m';
export const DefaultBackground = '\x1b[49m';

export const BlackForeground = '\x1b[30m';
export const RedForeground = '\x1b[31m';
export const GreenForeground = '\x1b[32m';
export const YellowForeground = '\x1b[33m';
export const BlueForeground = '\x1b[34m';
export const MagentaForeground = '\x1b[35m';
export const CyanForeground = '\x1b[36m';
export const WhiteForeground = '\x1b[37m';

export const BlackBackground = '\x1b[40m';
export const RedBackground = '\x1b[41m';
export const GreenBackground = '\x1b[42m';
export const YellowBackground = '\x1b[43m';
export const BlueBackground = '\x1b[44m';
export const MagentaBackground = '\x1b[45m';
export const CyanBackground = '\x1b[46m';
export const WhiteBackground = '\x1b[47m';

export const BrightBlackForeground = '\x1b[90m';
export const BrightRedForeground = '\x1b[91m';
export const BrightGreenForeground = '\x1b[92m';
export const BrightYellowForeground = '\x1b[93m';
export const BrightBlueForeground = '\x1b[94m';
export const BrightMagentaForeground = '\x1b[95m';
export const BrightCyanForeground = '\x1b[96m';
export const BrightWhiteForeground = '\x1b[97m';

export const BrightBlackBackground = '\x1b[100m';
export const BrightRedBackground = '\x1b[101m';
export const BrightGreenBackground = '\x1b[102m';
export const BrightYellowBackground = '\x1b[103m';
export const BrightBlueBackground = '\x1b[104m';
export const BrightMagentaBackground = '\x1b[105m';
export const BrightCyanBackground = '\x1b[106m';
export const BrightWhiteBackground = '\x1b[107m';

export function colorToAnsi(position: ColorPosition, color: Color): string {
    if (position == ColorPosition.Foreground)
    {
        switch (color)
        {
            case Color.Default:
                return DefaultForeground;
            case Color.Black:
                return BlackForeground;
            case Color.Red:
                return RedForeground;
            case Color.Green:
                return GreenForeground;
            case Color.Yellow:
                return YellowForeground;
            case Color.Blue:
                return BlueForeground;
            case Color.Magenta:
                return MagentaForeground;
            case Color.Cyan:
                return CyanForeground;
            case Color.BrightBlack:
                return BrightBlackForeground;
            case Color.White:
                return WhiteForeground;
            case Color.BrightRed:
                return BrightRedForeground;
            case Color.BrightGreen:
                return BrightGreenForeground;
            case Color.BrightYellow:
                return BrightYellowForeground;
            case Color.BrightBlue:
                return BrightBlueForeground;
            case Color.BrightMagenta:
                return BrightMagentaForeground;
            case Color.BrightCyan:
                return BrightCyanForeground;
            case Color.BrightWhite:
                return BrightWhiteForeground;
        }
    }
    else
    {
        switch (color)
        {
            case Color.Default:
                return DefaultBackground;
            case Color.Black:
                return BlackBackground;
            case Color.Red:
                return RedBackground;
            case Color.Green:
                return GreenBackground;
            case Color.Yellow:
                return YellowBackground;
            case Color.Blue:
                return BlueBackground;
            case Color.Magenta:
                return MagentaBackground;
            case Color.Cyan:
                return CyanBackground;
            case Color.BrightBlack:
                return BrightBlackBackground;
            case Color.White:
                return WhiteBackground;
            case Color.BrightRed:
                return BrightRedBackground;
            case Color.BrightGreen:
                return BrightGreenBackground;
            case Color.BrightYellow:
                return BrightYellowBackground;
            case Color.BrightBlue:
                return BrightBlueBackground;
            case Color.BrightMagenta:
                return BrightMagentaBackground;
            case Color.BrightCyan:
                return BrightCyanBackground;
            case Color.BrightWhite:
                return BrightWhiteBackground;
        }
    }
}