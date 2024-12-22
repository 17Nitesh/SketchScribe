import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import { useNavigate } from 'react-router-dom';
const DrawingCanvas = ({ socket, roomCode, drawer }) => {
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Listen for drawing events from other users
    socket.on('draw', (data) => {
      setLines((prevLines) => [...prevLines, data]);
    });

    // Clean up the socket listener on component unmount
    return () => {
      socket.off('draw');
    };
  }, [socket, navigate]);

  const handleMouseDown = (e) => {
    if (socket.id !== drawer.id) {
      return;
    }
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = { tool, points: [pos.x, pos.y] };
    setLines((prevLines) => [...prevLines, newLine]);

    if (socket) {
      socket.emit('draw', newLine, roomCode);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    if (socket.id !== drawer.id) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prevLines) => {
      const lastLine = { ...prevLines[prevLines.length - 1] };
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      const newLines = [...prevLines.slice(0, -1), lastLine];
      if (socket) {
        socket.emit('draw', lastLine, roomCode);
      }
      return newLines;
    });
  };

  const handleMouseUp = () => {
    if (socket.id !== drawer.id) {
      return;
    }
    isDrawing.current = false;
  };

  return (
    <div className="drawing-canvas">
      <Stage
        width={window.innerWidth / 3}
        height={window.innerHeight / 2}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage><select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>

      </select>
    </div>
  );
};

export default DrawingCanvas;
