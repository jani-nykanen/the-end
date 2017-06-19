/*! Boss base
 * @author Jani Nykänen
 */

/*! Boss base class */
class BossBase
{
    /*! Constructor */
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.speed = {x:0,y:0};
        this.target = {x:0,y:0};
        this.angle = 0;
        this.plantScaleMod = 0.0;
        this.plantSize = 0;
        this.plantDying = false;
        this.plantDead = false;
        this.hurtTimer = 0;
        this.faceDead = false;
        this.faceDeathTimer = 0;

        this.ringPos = new Array(8);
        for(var i = 0; i < this.ringPos.length; i++)
        {
            this.ringPos[i] = {x:0,y:0};
        }

        this.dead = false;
        this.deathTimer = 0;
    }

    /*! Calculate ring positions */
    CalculateRingPos()
    {
        var radius = Math.hypot(this.x,this.y);
        var dist = 0;

        for(var i = 0; i < this.ringPos.length; i ++)
        {
            dist =  ( (radius)/this.ringPos.length * i );

            this.ringPos[i].x = Math.cos(this.angle) * dist;
            this.ringPos[i].y = Math.sin(this.angle) * dist;
        }
    }

    /*! Special movement, if hp <= 3000
     * @param timeMod Time modifier
     */
    SpecialMovement(timeMod)
    {
        var pangle = Math.atan2(this.y-GameObjects.player.y,this.x-GameObjects.player.x);
        

        this.target.x = -Math.cos(pangle) * 0.035;
        this.target.y = -Math.sin(pangle) * 0.035;

        if(this.target.x > this.speed.x)
        {
            this.speed.x += 0.00025 * timeMod;
            this.speed.x = this.speed.x > this.target.x ? this.target.x : this.speed.x;
        }
        else if(this.target.x < this.speed.x)
        {
            this.speed.x -= 0.00025 * timeMod;
            this.speed.x = this.speed.x < this.target.x ? this.target.x : this.speed.x;
        }

        if(this.target.y > this.speed.y)
        {
            this.speed.y += 0.00025 * timeMod;
            this.speed.y = this.speed.y > this.target.y ? this.target.y : this.speed.y;
        }
        else if(this.target.y < this.speed.y)
        {
            this.speed.y -= 0.00025 * timeMod;
            this.speed.y = this.speed.y < this.target.y ? this.target.y : this.speed.y;
        }

        this.x += this.speed.x * timeMod;
        this.y += this.speed.y * timeMod;

        this.angle = Math.atan2(this.y,this.x);
        if(Math.hypot(this.x,this.y) > 2.45)
        {
            this.x = Math.cos(this.angle)*2.45;
            this.y = Math.sin(this.angle)*2.45;
        }
        this.CalculateRingPos();
    }

    /*! Update 
     * @param timeMod Time modifier 
     */
    Update(timeMod)
    {
        if(this.dead)
        {
            if(this.deathTimer > 0)
                this.deathTimer -= 0.5 * timeMod;
            return;
        }

        if(Status.bossHealth <= 0)
        {
            this.dead = true;
            this.deathTimer = 60;
            Camera.Shake(120,8.0);
            return;
        }

        if(this.plantDead == false)
        {
            if(this.plantDying == false)
            {
                this.plantScaleMod += 0.05 * timeMod;
                this.plantSize = 0.95 + 0.05 * Math.sin(this.plantScaleMod);

                if(Status.handsDefeated >= 4)
                    this.plantDying = true;
            }
            else
            {
                this.plantSize -= 0.005 * timeMod;
                if(this.plantSize < 0.45)
                {
                    this.plantDead = true;
                }
            }
        }
        else
        {
            if(this.hurtTimer > 0)
                this.hurtTimer -= 1.0 * timeMod;

            if(this.faceDeathTimer > 0)
                this.faceDeathTimer -= 0.5 * timeMod;

            if(!this.faceDead && Status.bossHealth <= 3000)
            {
                this.faceDeathTimer = 60;
                this.faceDead = true;
                Camera.Shake(60,6);
            }

            if(this.faceDead && this.faceDeathTimer <= 0.0)
            {
                this.SpecialMovement(timeMod);
                this.plantScaleMod += 0.05 * timeMod;
                this.plantSize = 0.5 + 0.025 * Math.sin(this.plantScaleMod);
            }
        }
    }

    /*! On bullet collision
     * @param b Bullet
     */
    OnBulletCollision(b)
    {
        if(b.exist == false || this.dead) return;

        var dist = Math.hypot(this.x-b.x,this.y-b.y);

        if(this.plantDead == false && dist < 0.7)
        {
            b.exist = false;
            b.deathTimer = 30;
        }
        else if(dist < 0.45)
        {
            Status.bossHealth -= b.power;
            Status.AddPoints(b.type == BulletType.Friendly ? 10 : 1000);
            if(this.hurtTimer <= 0)
                this.hurtTimer = 30;
            b.exist = false;
            b.deathTimer = 30;
        }
    }

    /*! On player collision
     * @param p Player
     */
    OnPlayerCollision(p)
    {
        if(this.dead) return;

        var dist = Math.hypot(this.x-p.x,this.y-p.y);

        if(this.plantDead == false && dist < 0.75)
        {
            var angle = Math.atan2(this.y-p.y,this.x-p.x);
            p.x -= Math.cos(angle) * (0.75-dist);
            p.y -= Math.sin(angle) * (0.75-dist);
        }
        else if(dist < 0.5)
        {
            p.Hurt();
        }
    }

    /*! Draw
     * @paramg g Graphics object
     */
    Draw(g)
    {
        var alpha = 1.0;
        var whiteness = 1.0;
        var scale = 1.0;
        if(this.deathTimer > 0 && this.dead)
        {
            alpha = 1.0/60.0 * this.deathTimer;
            whiteness = 255 * (1-alpha) + 1.0;
            scale += 1.0-alpha;
        }

        g.eff.Reset();
        if(this.faceDead && this.faceDeathTimer <= 0)
        {
            g.eff.Use();

            g.DrawCenteredBitmap(Assets.textures.plant,0,0,0,1.75*this.plantSize,1.75*this.plantSize);

            if(this.deathTimer <= 0.0 && this.dead)
                return;

            g.eff.SetColor(1.0,1.0,1.0,alpha);
            g.eff.Use();
            for(var i = 0; i < this.ringPos.length; i ++)
            {
                g.DrawCenteredBitmap(Assets.textures.ring,this.ringPos[i].x,this.ringPos[i].y,0,0.35,0.35);
            }
        }

        g.eff.Reset();
        if(this.plantDead == false)
        {
            g.DrawCenteredBitmap(Assets.textures.plant,this.x,this.y,0,1.75*this.plantSize,1.75*this.plantSize);
        }
        else
        {
            if(this.deathTimer > 0 && this.dead)
            {
                g.eff.SetColor(whiteness,whiteness,whiteness,alpha);
            }
            else
            {
                if(this.hurtTimer > 0 && Math.floor(this.hurtTimer/4) % 2 == 0)
                {
                    g.eff.SetColor(2.0,0.5,0.5,1.0);
                }

            }
        }
        g.eff.Use();

        g.DrawCenteredBitmap(Status.bossHealth <= 3000 ? Assets.textures.face2 : Assets.textures.face1,
            this.x,this.y,0,1.0*scale,1.0*scale);

        if(this.faceDead && this.faceDeathTimer > 0)
        {
            var alpha = 1.0/60.0 * this.faceDeathTimer;
            g.eff.SetColor(alpha,alpha,alpha,alpha);
            g.eff.Use();

            g.DrawCenteredBitmap(Assets.textures.face1,
                this.x,this.y,0,1.0 + 2*(1-alpha),1.0 + 2*(1-alpha));
        }
    }
}