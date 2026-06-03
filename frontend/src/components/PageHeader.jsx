
/*
    Reusable page header component
*/

function PageHeader({label, title, description, actions}){
    return(
        <div className="page-header">
            {label && <p className="page-header-label">{label}</p>}

            <div className="page-header-row">
                <div>
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                </div>

                {actions && <div className="page-header-actions">{actions}</div>}
            </div>
        </div>
    );
}

export default PageHeader;