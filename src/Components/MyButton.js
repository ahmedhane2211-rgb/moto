import { Button, Spinner } from "react-bootstrap";

function MyButton({
    text,
    loading = false,
    variant = "",
    type = "submit",
    className = "w-100",
    onClick,
}) {
    return (
        <Button
            variant={variant}
            type={type}
            className={`${className} my-btn`}
            disabled={loading}
            onClick={onClick}
        >
            {loading ? <Spinner animation="border" size="sm" /> : text}
        </Button>
    );
}

export default MyButton;
