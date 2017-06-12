/*! Game scene
 * @author Jani Nykänen
 */

/*! Game class */
class Game extends Scene
{
    /*! Init, see scene.js */
    Init(g,Super)
    {
        this.Super = Super;
        Stage.Init(Super);
    }

    /*! Draw, see scene.js*/
    Draw(g)
    {
        g.ChangeShader(ShaderType.Default);

        g.SetDepthTesting(false);

        g.ClearScreen(0.75,0.75,0.75);

        Stage.Draw(g);

        g.transf.Ortho2D(this.Super.canvas.width,this.Super.canvas.height);
        g.transf.Identity();
        g.transf.Use();

        g.ChangeShader(ShaderType.Default);

        g.DrawText(this.Super.font,Assets.textures.font16,"Press F4 to go full screen",2,240-16,0);
        g.DrawText(this.Super.font,Assets.textures.font16,"FPS: " + (Math.round(60.0/this.Super.timeMod)).toString() ,2,2,0);

        g.DrawBitmapRegion(Assets.textures.cursor,0,0,16,24,Controls.mouse.vpos.x,Controls.mouse.vpos.y,16,24);
        
    }

    /*! Update, see scene.js */
    Update(timeMod)
    {
        Stage.Update(timeMod);
    }
}