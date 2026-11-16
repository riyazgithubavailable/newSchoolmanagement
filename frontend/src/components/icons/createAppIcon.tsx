// src/components/icons/createAppIcon.tsx
import * as React from "react";

export type AppIconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    title?: string;
};

export function createAppIcon(
    displayName: string,
    viewBox: string,
    iconNode: React.ReactNode
) {
    const Component = React.forwardRef<SVGSVGElement, AppIconProps>(
        (
            {
                size = 24,
                color = "currentColor",
                className,
                title,
                children,
                ...props
            },
            ref
        ) => {
            return (
                <svg
                    ref={ref}
                    xmlns="http://www.w3.org/2000/svg"
                    width={size}
                    height={size}
                    viewBox={viewBox}
                    fill="none"
                    className={className}
                    aria-hidden={title ? undefined : true}
                    role={title ? "img" : "presentation"}
                    {...props}
                >
                    {title ? <title>{title}</title> : null}

                    <g fill={color}>
                        {iconNode}
                    </g>

                    {children}
                </svg>
            );
        }
    );

    Component.displayName = displayName;
    return Component;
}