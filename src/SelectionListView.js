import React, {Component} from 'react'

export default class SelectionListView extends Component {
    keyDown = (e) => {
        e.preventDefault()
        const index = this.props.list.indexOf(this.props.selected)
        if(e.keyCode === 40) { // down arrow
            if (index >= 0 && index < this.props.list.length - 1) {
                const newItem = this.props.list[index+1]
                this.props.onSelect(newItem)
            }
        }
        if(e.keyCode === 38) { // up arrow
            if(index > 0) {
                const newItem = this.props.list[index-1]
                this.props.onSelect(newItem)
            }
        }

    }
    render() {
        const Template = this.props.template
        const makeTemplate = this.props.makeTemplate
        const style = this.props.style || {}
        return <ul className="selection-list-view" onKeyDown={this.keyDown} tabIndex={0} style={style}>
            {this.props.list.map((item,i)=>{
                if(makeTemplate) return makeTemplate(item,i)
                return <Template key={i} item={item}
                                 onSelect={this.props.onSelect}
                                 selected={item===this.props.selected}/>
            })}
        </ul>
    }
}

