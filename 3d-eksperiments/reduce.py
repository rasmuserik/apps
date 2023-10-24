import bpy

#files = ["0k225g682_08-smk-hebe-inv-kas2918.stl","0p096c31x_smk-kas1164-reclining-lion.stl","1r66j587n_smk-22-kms5317.stl","2f75rd61c_smk-25-inv-kms5400-seated-bear.stl","3197xr938_smk16-kas115-pieta-michelangelo.stl","3197xr95t_smk56-kas633-edited.stl","3n204399k_acropolis-caryatid.stl","41687p033_smk17-5806.stl","4x51hp82v_inv-52c.stl","5m60qx27n_smk-109-kas240.stl","6682x851h_smk-kas65-augustus-prima-porta.stl","6m311v17d_smk25-kms-panther-and-man.stl","76537587p_12-smk-terpischore-inv.stl","7h149v29m_smk-kms5471-girl-with-cats.stl","7m01br571_smk15-kas1133-2-marcus-aurelius-horse-hollow.stl","8k71nn47d_smk-ecclesia-396.stl","9306t392t_smk48-kas629.stl","9306t3933_smk49-kas1959-francesco-assisi.stl","9593v0807_acropolis-caryatid-decimated.stl","b5644x06s_penelope-1.stl","bc386p87j_smk15-kas1133-2-marcus-aurelius-horse.stl","bn999c40m_smk-kas541-5-aphaia-seated-hercules.stl","bn999c41w_3-inv-735.stl","cf95jg529_john-the-baptist-donatello.stl","df65vd347_smk-kas-43.stl","df65vd372_smk-kas113-1-lorenzo-de-medici-decimated.stl","dn39x6162_smk-kas112-1-guiliano-de-medici-decimated.stl","dz010v80k_smk-16-kms5781-mermaid.stl","g158bn65n_smk23-kas397-overcome-judaism.stl","g445cj932_smk39-kas837-capitoline-wolf-decimated.stl","g732df32k_smk52-kas255-athena-pallas-giustiniani.stl","h415pg25s_smk-kas805-bek-en-kons.stl","hh63t1768_41-smk-mater-dolorosa-germain-pilon-louvre-hollowback.stl","jd4731994_23-pudicitia-woman-in-chiton-and-himation.stl","k643b6144_smk-kas112-1-guiliano-de-medici-decimated.stl","kw52jd76r_smk-kas2128-aphaia-athena-with-shield.stl","m900p022q_154-smk-inv-243-moses.stl","n583z056x_smk-20-kms5032.stl","q811kq365_smk-kas37-king-khafre.stl","qv33s2091_112-1221.stl","qz20sz182_smk-31-kms6017-allegory.stl","rn3015822_153-kas82.stl","s4655n294_144-john-the-baptist-inv-465.stl","s4655n33q_smk-kas-126a.obj.stl","t435gj47q_113-smk-inv-862-ztl.stl","tt44ps689_smk15-smk5387.stl","tt44ps735_smk-kas2125-aphaia-kneeling-archer.stl","v979v730x_smk-103-kas35.stl","valkyrien_fra_haarby_lukket.stl","xg94hv24q_smk-kas2228-woman-grinding-flour.stl"];
files = ["51289.glb","51294.glb","51536.glb","51576.glb","51290.glb","51535.glb","51557.glb","51577.glb"]
for file in files:
    bpy.ops.object.select_all(action='DESELECT')  # Deselect all objects
    bpy.ops.object.select_by_type(type='MESH')    # Select all mesh objects
    bpy.ops.object.delete()                       # Delete selected objects
    
    input_file = "natmus/" + file 
    #bpy.ops.import_mesh.stl(filepath=input_file)  # Import STL file
    bpy.ops.import_scene.gltf(filepath=input_file);
    
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0] 
    
    bpy.ops.object.modifier_add(type='DECIMATE')
    bpy.context.object.modifiers["Decimate"].ratio = 0.2 
    bpy.ops.object.modifier_apply({"object": bpy.context.object}, modifier="Decimate")
    
    bpy.ops.export_scene.gltf(filepath="natmus-out/" + file + ".gltf")
    
    bpy.ops.wm.quit_blender()
    
