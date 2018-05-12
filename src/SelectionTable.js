import React, {Component} from 'react'

export default class SelectionTable extends Component {
    render() {
        const {ItemTemplate, HeaderTemplate, makeItemTemplate, list, columns, ...rest} = this.props
        return <div {...rest}><table>
            {this.renderHeader()}
            <tbody>
            {this.renderBody(this.props.list,'')}
            </tbody>
        </table></div>
    }
    renderHeader() {
        const {HeaderTemplate} = this.props
        return <thead>
        <tr>{Object.keys(this.props.columns).map(col => {
            return <HeaderTemplate key={col} column={col} columns={this.props.columns} list={this.props.list}/>
        })}</tr>
        </thead>
    }

    renderBody(list,key) {
        const {ItemTemplate} = this.props
        return list.map((row,i)=>{
            return <tr key={i+"-"+key}>
                {
                    Object.keys(this.props.columns).map(col => {
                        return this.props.makeItemTemplate(col,row,col)
                        // return <ItemTemplate key={col} row={row}
                        //                      column={col}
                        //                      onSelect={this.props.onSelect}
                        //                      selected={this.props.isSelected(row)}
                        //                      app={this.props.app}
                        // />
                    })
                }
            </tr>
        })
    }
}
