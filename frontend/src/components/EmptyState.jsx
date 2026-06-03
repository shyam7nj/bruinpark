
/*
    Empty-state message for sections without any data
*/

function EmptyState({title = "Nothing here yet.", message}){
    return(
        <div className="empty-state">
            <p className="empty-state-title">{title}</p>
            {message && <p>{message}</p>}
        </div>
    );
}

export default EmptyState;