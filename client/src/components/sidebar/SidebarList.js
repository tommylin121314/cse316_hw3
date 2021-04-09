import React        from 'react';
import SidebarEntry from './SidebarEntry';

const SidebarList = (props) => {
    let lists = [];
    props.todolists.map((list,index) => lists[index] = list);

    if(props.activeid){
        let index = -1;
        for(let i = 0; i < lists.length; i++) {
            if(lists[i].id === props.activeid) {
                index = i;
                break;
            }
        }
        for(let i = index; i > 0; i--) {
            let temp = lists[i];
            lists[i] = lists[i-1];
            lists[i-1] = temp;
        }
    }

    console.log("HAS ACTIVE LIST: " + props.activeid);
    console.log(lists);

    return (
        <>
            {
                props.todolists &&
                lists.map(todo => (
                    <SidebarEntry
                        handleSetActive={props.handleSetActive} activeid={props.activeid}
                        id={todo.id} key={todo.id} name={todo.name} _id={todo._id}
                        updateListField={props.updateListField}
                    />
                ))
            }
        </>
    );
};

export default SidebarList;