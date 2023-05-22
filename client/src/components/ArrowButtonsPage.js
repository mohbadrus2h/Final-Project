import React, { useState, useEffect } from 'react';
import './ArrowButtonsPage.css';

function ArrowButtonsPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [rightArrowValue, setRightArrowValue] = useState(0);
    const [leftArrowValue, setLeftArrowValue] = useState(0);
    const [elevValue, setElevValue] = useState(0);

    function handleUpArrowClick() {
        if (elevValue >= 0){
            setElevValue(elevValue + 10);
            console.log(elevValue);
            if (elevValue == 180) {
                setElevValue(180);
            }
        }
    }

    function handleDownArrowClick() {
        if (elevValue <= 180) {
            setElevValue(elevValue - 10);
            console.log(elevValue);
            if (elevValue == 0) {
                setElevValue(0);
            }
        }
    }

    function handleRightArrowClick() {
        setRightArrowValue(1);
    }

    function handleLeftArrowClick() {
        setLeftArrowValue(1);
    }

    function handleRightArrowRelease() {
        setRightArrowValue(0);
    }

    function handleLeftArrowRelease() {
        setLeftArrowValue(0);
    }
    
    // function handleOpenModal() {
    //     setModalOpen(true);
    // }

    // function handleCloseModal() {
    //     setModalOpen(false);
    // }
        return (
            <div>
                {/* <button onClick={handleOpenModal}>Open Arrow Buttons</button>
                {modalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close-toggle" onClick={handleCloseModal}>&times;</span>
                            <div className="arrow-container"> */}
                                <button className="arrow-up" onClick={handleUpArrowClick}>&uarr;</button>
                                <button className="arrow-right" onMouseDown={handleRightArrowClick} onMouseUp={handleRightArrowRelease}>&rarr;</button>
                                <button className="arrow-left" onMouseDown={handleLeftArrowClick} onMouseUp={handleLeftArrowRelease}>&larr;</button>
                            {/* </div>
                            <p className='monitor-value'>right : {rightArrowValue}, left : {leftArrowValue}</p>
                            <div className="data-display-container">
                                <div className="data-box">
                                    <h3>Azimuth</h3>
                                    <p>{rightArrowValue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        );
    }

    export default ArrowButtonsPage;
