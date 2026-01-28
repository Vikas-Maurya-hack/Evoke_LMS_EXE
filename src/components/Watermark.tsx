import watermarkImage from '/logo-icon.png';

export function Watermark() {
    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50%',
                maxWidth: '600px',
                height: '50%',
                maxHeight: '600px',
                opacity: 0.05,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'opacity 0.3s ease',
            }}
            className="dark:opacity-[0.07]"
        >
            <img
                src={watermarkImage}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
            />
        </div>
    );
}
