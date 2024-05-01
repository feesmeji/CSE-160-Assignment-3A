class Cube{
    constructor(){
        this.type='cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0,1.0,1.0,1.0];
        // this.size = 5.0;
        // this.segments = 3;
        this.matrix = new Matrix4();
    }
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        //Pass color of a point to u_FragColor var
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);


        // Pass the color of a point to u_FragColor uniform variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);        
        
    
//CHATGPT Helped me center the cube on the origin with the correct coordinates.
//I later mapped out by hand each point on a visualizing tool to make sure it was positioned correctly centered on the origin.
// I originally was printing cubes on the 1st quadrant which I didn't like.
    
    // Front face (already provided) UV
    drawTriangle3DUV([0,0,0,    1,1,0,    1,0,0 ], [0,0,  1,1,  1,0]);
    drawTriangle3DUV([0,0,0,    0,1,0,    1,1,0 ], [0,0,  0,1,  1,1]);

    // Right face
    drawTriangle3DUV([1,0,0,    1,1,1,    1,0,1 ], [0,0,  1,1, 1,0]);
    drawTriangle3DUV([1,0,0,    1,1,0,    1,1,1 ], [0,0,  0,1, 1,1]);

    // Back face
    drawTriangle3DUV([0,0,1,    1,1,1,    1,0,1 ], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0,0,1,    0,1,1,    1,1,1 ], [0, 0, 0, 1, 1, 1]);

    // Left face
    drawTriangle3DUV([0,0,0,    0,1,1,    0,0,1 ], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0,0,0,    0,1,0,    0,1,1 ], [0, 0, 0, 1, 1, 1]);

    // Top face
    drawTriangle3DUV([0,1,0,    1,1,1,    1,1,0 ], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0,1,0,    0,1,1,    1,1,1 ], [0, 0, 0, 1, 1, 1]);

    // Bottom face
    drawTriangle3DUV([0,0,0,    1,0,1,    1,0,0 ], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0,0,0,    0,0,1,    1,0,1 ], [0, 0, 0, 1, 1, 1]);

// ----------------UV End


    //Front of cube
    drawTriangle3D( [0,0,0,  1,1,0,  1,0,0 ]);
    drawTriangle3D( [0,0,0,  0,1,0,  1,1,0 ]);


    //Back of cube (when drawing things, webgl renders objects closer to the camera when the z coordinate is less than zero. Further away from camera if z axis is greater than zero)
    drawTriangle3D( [0,0,1,  1,1,1,  1,0,1 ]);
    drawTriangle3D( [0,0,1,  0,1,1,  1,1,1 ]);
    // Fake lighting (Pass the color of a point to u_FragColor uniform variable)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

    //Top of cube
    drawTriangle3D( [0,1,0,   0,1,1,  1,1,1]);
    drawTriangle3D( [0,1,0,   1,1,1,  1,1,0]);
    
    //Bottom of cube
    drawTriangle3D( [0,0,0,   0,0,1,  1,0,1]);
    drawTriangle3D( [0,0,0,   1,0,1,  1,0,0]);

    //Right side of cube
    drawTriangle3D([1,1,1,   1,0,1,    1, 0, 0])// right side of cube triangle 1
    drawTriangle3D([1,1,1,   1,1,0,    1, 0, 0])//right side of cube triangle 2

    //Left side of triangle
    drawTriangle3D([0,0,0,   0,1,0,   0,1,1]) //left side of cube triangle 1
    drawTriangle3D([0,0,0,   0,0,1,   0,1,1]) //left side of cube triangle 2
    }

}