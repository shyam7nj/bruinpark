
/*
    Shared button component. Can render normal clickable buttons as well as links
    -   <button> and <a> 
*/

function Button({children, href, variant = "primary", type = "button", onClick, disabled}){

    const className = `button button-${variant}`;
    if(href){
        return(
            <a className={className} href={href}>
                {children}
            </a>
        );
    }

    return(
        <button className={className} type={type} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

export default Button;