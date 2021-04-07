import React from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';

const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const undoStyle = props.disabled ? 'table-header-button-disabled' :
                        (!props.canUndo ? 'table-header-button disabled-button' : 'table-header-button');
    const redoStyle = props.disabled ? 'table-header-button-disabled' :
                        (!props.canRedo ? 'table-header-button disabled-button' : 'table-header-button');

    const clickDisabled = () => { };

    const handleSortList = (e) => {
        console.log(e.target.innerHTML);
        console.log(props.listId)
        props.sortItems(props.listId, e.target.innerHTML);
    }

    return (
        <WRow className="table-header">
            <WCol size="3">
                <WButton onClick={handleSortList}
                    className='table-header-section' wType="texted" >Task</WButton>
            </WCol>

            <WCol size="2">
                <WButton onClick={handleSortList}
                    className='table-header-section' wType="texted">Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton onClick={handleSortList}
                    className='table-header-section' wType="texted" >Status</WButton>
            </WCol>

            <WCol size="2">
                <WButton onClick={handleSortList}
                    className='table-header-section' wType="texted" >Assigned To</WButton>
            </WCol>

            <WCol size="3">
                <div className="table-header-buttons">
                    <WButton className={`${undoStyle}`} onClick={props.disabled ? clickDisabled :props.undo} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">undo</i>
                    </WButton>
                    <WButton className={`${redoStyle}`} onClick={props.disabled ? clickDisabled :props.redo} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">redo</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.addItem} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">add_box</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.setShowDelete} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">delete_outline</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.closeList} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">close</i>
                    </WButton>
                </div>
            </WCol>

        </WRow>
    );
};

export default TableHeader;