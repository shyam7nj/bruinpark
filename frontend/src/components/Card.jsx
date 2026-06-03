
/*
    Shared card container used for panels
*/

function Card({children, className = ""}){
    return(
        <section className={`card ${className}`}>
            {children}
        </section>
    );
}

export default Card;