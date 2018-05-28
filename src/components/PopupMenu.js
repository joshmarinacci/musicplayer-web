import React, {Component} from 'react'
import "./popup.css"

const DefaultMenuItemTemplate = (props) => {
    return <button className="item" onClick={props.item.onClick}>{props.item.title}</button>
}
export default class PopupMenu extends Component {
    render() {
        let Template = this.props.template
        if(!Template) Template = DefaultMenuItemTemplate
        const items = this.props.list.map((item,i) => <Template key={i} item={item}/>)
        return <div className="popup-menu">{items}</div>
    }
}

