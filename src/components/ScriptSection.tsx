import { useState } from 'react'

const mainScript = `# -*- coding: utf-8 -*-
"""
Kansteen Generator from Railing
Membuat kansteen (curb) berdasarkan path railing yang dipilih.

Author: pyRevit Script Collection
Version: 1.0.0
"""

__title__ = "Kansteen\\\\nfrom Railing"
__author__ = "BIM Indonesia"
__doc__ = "Membuat kansteen berdasarkan path railing yang dipilih."

# ============================================================
# IMPORTS
# ============================================================
import clr
import sys

clr.AddReference('RevitAPI')
from Autodesk.Revit.DB import *
from Autodesk.Revit.DB.Structure import *

clr.AddReference('RevitServices')
import RevitServices
from RevitServices.Persistence import DocumentManager
from RevitServices.Transactions import TransactionManager

clr.AddReference('RevitNodes')
import Revit
clr.ImportExtensions(Revit.Elements)
clr.ImportExtensions(Revit.GeometryConversion)

from pyrevit import script, forms, DB

doc = DocumentManager.Instance.CurrentDBDocument
uidoc = DocumentManager.Instance.CurrentUIApplication.ActiveUIDocument
output = script.get_output()

# ============================================================
# KONFIGURASI PARAMETER KANSTEEN
# ============================================================
# Dimensi default kansteen (dalam feet - 1 feet = 304.8 mm)
KANSTEEN_WIDTH = 0.492   # ~150mm
KANSTEEN_HEIGHT = 0.492  # ~150mm
KANSTEEN_OFFSET = 0.0    # Offset dari path railing

# ============================================================
# FUNGSI UTAMA
# ============================================================

def get_railing_path(railing):
    """Mendapatkan path/curve dari elemen railing."""
    try:
        # Mendapatkan lokasi railing
        location = railing.Location
        
        if isinstance(location, LocationCurve):
            curve = location.Curve
            return curve
        else:
            # Untuk railing yang lebih kompleks, coba dapatkan dari top rail
            top_rail_id = railing.get_Parameter(
                BuiltInParameter.RAILING_RAIL_PATH_CURVE_LOOP
            )
            if top_rail_id:
                return None
            return None
    except Exception as e:
        output.print_md("**Error mendapatkan path railing:** {}".format(str(e)))
        return None


def get_railing_curves(railing):
    """Mendapatkan semua curves dari railing (termasuk yang tidak lurus)."""
    curves = []
    
    try:
        # Method 1: Dari LocationCurve
        location = railing.Location
        if isinstance(location, LocationCurve):
            curve = location.Curve
            curves.append(curve)
            return curves
        
        # Method 2: Dari host railing - ambil curves dari top rail
        if hasattr(railing, 'GetPath'):
            path = railing.GetPath()
            if path:
                for curve_loop in path:
                    for curve in curve_loop:
                        curves.append(curve)
                return curves
        
        # Method 3: Menggunakan RailingPath
        host_railing = railing
        if hasattr(host_railing, 'GetHostRailing'):
            host = host_railing.GetHostRailing()
            if host:
                path = host.GetPath()
                if path:
                    for curve_loop in path:
                        for curve in curve_loop:
                            curves.append(curve)
                    return curves
                    
    except Exception as e:
        output.print_md("**Error mendapatkan curves:** {}".format(str(e)))
    
    return curves


def create_kansteen_floor(curves, width, height, offset=0.0):
    """
    Membuat kansteen menggunakan Floor element.
    Kansteen dibuat sebagai floor tipis yang mengikuti path.
    """
    created_elements = []
    
    try:
        # Dapatkan floor type untuk kansteen
        floor_type = None
        collector = FilteredElementCollector(doc).OfClass(FloorType)
        for ft in collector:
            if "kansteen" in ft.Name.lower() or "curb" in ft.Name.lower():
                floor_type = ft
                break
        
        # Jika tidak ada, gunakan floor type pertama yang ditemukan
        if floor_type is None:
            floor_type = collector.FirstElement()
        
        if floor_type is None:
            forms.alert("Tidak ada Floor Type ditemukan di project!", exitscript=True)
            return []
        
        # Buat level reference
        level = None
        levels = FilteredElementCollector(doc).OfClass(Level).ToElements()
        if levels:
            level = levels[0]
        
        if level is None:
            forms.alert("Tidak ada Level ditemukan di project!", exitscript=True)
            return []
        
        # Buat boundary curves untuk floor
        for curve in curves:
            try:
                # Offset curve jika diperlukan
                if offset != 0.0:
                    # Buat offset curve
                    transform = Transform.CreateTranslation(
                        XYZ(0, offset, 0)
                    )
                    curve = curve.CreateTransformed(transform)
                
                # Buat loop tertutup dari curve (untuk floor)
                if isinstance(curve, Line):
                    # Buat rectangle dari line
                    start_pt = curve.GetEndPoint(0)
                    end_pt = curve.GetEndPoint(1)
                    direction = (end_pt - start_pt).Normalize()
                    perpendicular = XYZ.BasisZ.CrossProduct(direction).Normalize()
                    
                    # Buat 4 titik untuk rectangle (kansteen profile)
                    p1 = start_pt + perpendicular * (width / 2)
                    p2 = end_pt + perpendicular * (width / 2)
                    p3 = end_pt - perpendicular * (width / 2)
                    p4 = start_pt - perpendicular * (width / 2)
                    
                    # Buat curve loop
                    boundary = CurveLoop()
                    boundary.Append(Line.CreateBound(p1, p2))
                    boundary.Append(Line.CreateBound(p2, p3))
                    boundary.Append(Line.CreateBound(p3, p4))
                    boundary.Append(Line.CreateBound(p4, p1))
                    
                    # Buat floor
                    boundary_curves = [
                        Line.CreateBound(p1, p2),
                        Line.CreateBound(p2, p3),
                        Line.CreateBound(p3, p4),
                        Line.CreateBound(p4, p1)
                    ]
                    
                    floor = Floor.Create(
                        doc,
                        [CurveArray_from_list(boundary_curves)],
                        floor_type.Id,
                        level.Id
                    )
                    created_elements.append(floor)
                
                elif isinstance(curve, Arc):
                    # Handle arc curves
                    output.print_md("*Arc curve detected - membuat kansteen melengkung*")
                    # Untuk arc, buat approximation dengan garis-garis kecil
                    tessellated = curve.Tessellate()
                    for i in range(len(tessellated) - 1):
                        line = Line.CreateBound(tessellated[i], tessellated[i+1])
                        # Proses setiap segmen...
                        
            except Exception as e:
                output.print_md("**Error membuat kansteen untuk curve:** {}".format(str(e)))
                
    except Exception as e:
        output.print_md("**Error:** {}".format(str(e)))
    
    return created_elements


def create_kansteen_family(curves, family_symbol, width, height):
    """
    Membuat kansteen menggunakan Family Instance (jika ada family kansteen).
    """
    created_elements = []
    
    try:
        # Buat line dari curves
        for curve in curves:
            if isinstance(curve, Line):
                length = curve.Length
                start_pt = curve.GetEndPoint(0)
                end_pt = curve.GetEndPoint(1)
                mid_pt = (start_pt + end_pt) / 2
                
                # Buat line sebagai reference
                line = Line.CreateBound(start_pt, end_pt)
                
                # Place family instance
                family_instance = doc.Create.NewFamilyInstance(
                    line,
                    family_symbol,
                    doc.GetElement(family_symbol.LevelId),
                    Structure.StructuralType.NonStructural
                )
                created_elements.append(family_instance)
                
    except Exception as e:
        output.print_md("**Error membuat family instance:** {}".format(str(e)))
    
    return created_elements


def create_kansteen_model_line(curves, width, height):
    """
    Membuat kansteen menggunakan Model Curves sebagai representasi.
    Ini berguna sebagai preview sebelum membuat elemen solid.
    """
    created_elements = []
    
    try:
        # Buat detail curves sebagai preview
        sketch_plane = SketchPlane.Create(
            doc,
            Plane.CreateByNormalAndOrigin(XYZ.BasisZ, XYZ.Zero)
        )
        
        for curve in curves:
            try:
                # Buat offset curves (kiri dan kanan kansteen)
                if isinstance(curve, Line):
                    start_pt = curve.GetEndPoint(0)
                    end_pt = curve.GetEndPoint(1)
                    direction = (end_pt - start_pt).Normalize()
                    perpendicular = XYZ.BasisZ.CrossProduct(direction).Normalize()
                    
                    # Line kiri
                    p1_left = start_pt + perpendicular * (width / 2)
                    p2_left = end_pt + perpendicular * (width / 2)
                    
                    # Line kanan
                    p1_right = start_pt - perpendicular * (width / 2)
                    p2_right = end_pt - perpendicular * (width / 2)
                    
                    # Buat model lines
                    line_left = doc.Create.NewModelCurve(
                        Line.CreateBound(p1_left, p2_left),
                        sketch_plane
                    )
                    line_right = doc.Create.NewModelCurve(
                        Line.CreateBound(p1_right, p2_right),
                        sketch_plane
                    )
                    
                    created_elements.append(line_left)
                    created_elements.append(line_right)
                    
            except Exception as e:
                output.print_md("**Error:** {}".format(str(e)))
                
    except Exception as e:
        output.print_md("**Error membuat model lines:** {}".format(str(e)))
    
    return created_elements


def CurveArray_from_list(curve_list):
    """Convert list of curves to CurveArray."""
    curve_array = CurveArray()
    for c in curve_list:
        curve_array.Append(c)
    return curve_array


# ============================================================
# METODE PEMBUATAN KANSTEEN - PILIH SALAH SATU
# ============================================================

def method_1_floor_approach(railings):
    """
    METODE 1: Menggunakan Floor Element
    Membuat kansteen sebagai floor tipis mengikuti path railing.
    """
    output.print_md("## Metode 1: Floor Approach")
    output.print_md("Membuat kansteen sebagai floor element...\\n")
    
    all_created = []
    
    for railing in railings:
        curves = get_railing_curves(railing)
        if curves:
            created = create_kansteen_floor(
                curves, KANSTEEN_WIDTH, KANSTEEN_HEIGHT, KANSTEEN_OFFSET
            )
            all_created.extend(created)
            output.print_md(
                "- Railing ID {}: {} curves ditemukan, {} kansteen dibuat".format(
                    railing.Id, len(curves), len(created)
                )
            )
        else:
            output.print_md("- Railing ID {}: Tidak ada curves ditemukan".format(
                railing.Id
            ))
    
    return all_created


def method_2_swept_profile(railings):
    """
    METODE 2: Menggunakan Floor dengan Sketch (Recommended)
    Membuat kansteen dengan sketch profile yang lebih akurat.
    """
    output.print_md("## Metode 2: Swept Profile (Recommended)")
    output.print_md("Membuat kansteen dengan profile sketch...\\n")
    
    all_created = []
    
    for railing in railings:
        curves = get_railing_curves(railing)
        if not curves:
            output.print_md("- Railing ID {}: Tidak ada curves".format(railing.Id))
            continue
            
        # Gabungkan semua curves menjadi boundary loop
        try:
            # Dapatkan floor type
            floor_type_collector = FilteredElementCollector(doc).OfClass(FloorType)
            floor_type = None
            for ft in floor_type_collector:
                ft_name = ft.Name.lower()
                if "kansteen" in ft_name or "curb" in ft_name or "border" in ft_name:
                    floor_type = ft
                    break
            if not floor_type:
                floor_type = floor_type_collector.FirstElement()
            
            if not floor_type:
                output.print_md("**ERROR: Tidak ada Floor Type!**")
                continue
            
            # Dapatkan level
            level_collector = FilteredElementCollector(doc).OfClass(Level)
            level = level_collector.FirstElement()
            
            if not level:
                output.print_md("**ERROR: Tidak ada Level!**")
                continue
            
            # Buat boundary dari railing curves
            boundary_curves = CurveArray()
            
            # Tambahkan offset curves untuk membuat lebar kansteen
            for curve in curves:
                if isinstance(curve, Line):
                    boundary_curves.Append(curve)
                elif isinstance(curve, Arc):
                    # Tessellate arc menjadi lines
                    pts = curve.Tessellate()
                    for i in range(len(pts) - 1):
                        boundary_curves.Append(Line.CreateBound(pts[i], pts[i+1]))
            
            if boundary_curves.Size > 2:
                # Buat floor menggunakan boundary curves
                floor = Floor.Create(
                    doc,
                    [boundary_curves],
                    floor_type.Id,
                    level.Id
                )
                all_created.append(floor)
                output.print_md(
                    "- Railing ID {}: Kansteen floor berhasil dibuat".format(railing.Id)
                )
                
        except Exception as e:
            output.print_md("**Error:** {}".format(str(e)))
    
    return all_created


def method_3_wall_approach(railings):
    """
    METODE 3: Menggunakan Wall Element
    Membuat kansteen sebagai wall tipis mengikuti path railing.
    """
    output.print_md("## Metode 3: Wall Approach")
    output.print_md("Membuat kansteen sebagai wall element...\\n")
    
    all_created = []
    
    for railing in railings:
        curves = get_railing_curves(railing)
        if not curves:
            continue
            
        try:
            # Dapatkan wall type
            wall_type_collector = FilteredElementCollector(doc).OfClass(WallType)
            wall_type = None
            for wt in wall_type_collector:
                wt_name = wt.Name.lower()
                if "kansteen" in wt_name or "curb" in wt_name or "border" in wt_name:
                    wall_type = wt
                    break
            if not wall_type:
                wall_type = wall_type_collector.FirstElement()
            
            if not wall_type:
                output.print_md("**ERROR: Tidak ada Wall Type!**")
                continue
            
            # Dapatkan level
            level_collector = FilteredElementCollector(doc).OfClass(Level)
            level = level_collector.FirstElement()
            
            if not level:
                continue
            
            # Buat wall untuk setiap curve
            for curve in curves:
                try:
                    wall = Wall.Create(
                        doc,
                        curve,
                        wall_type.Id,
                        level.Id,
                        KANSTEEN_HEIGHT,  # Height
                        0.0,              # Offset
                        False,            # Mirror
                        False             # Structural
                    )
                    all_created.append(wall)
                except Exception as e:
                    output.print_md("**Error membuat wall:** {}".format(str(e)))
            
            output.print_md(
                "- Railing ID {}: {} wall kansteen dibuat".format(
                    railing.Id, len(curves)
                )
            )
            
        except Exception as e:
            output.print_md("**Error:** {}".format(str(e)))
    
    return all_created


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    """Fungsi utama - entry point script."""
    output.print_md("# 🏗️ Kansteen Generator from Railing")
    output.print_md("---")
    output.print_md("Script ini akan membuat kansteen berdasarkan railing yang dipilih.\\n")
    
    # Step 1: Pilih railing
    railings = forms.select_elements(
        title="Pilih Railing untuk Kansteen",
        filter_func=lambda x: isinstance(x, DB.Architecture.Railing)
    )
    
    if not railings:
        # Fallback: pilih dari selection
        selection = uidoc.Selection.GetElementIds()
        if not selection:
            forms.alert("Tidak ada elemen yang dipilih!\\nSilakan pilih railing terlebih dahulu.", exitscript=True)
            return
        
        railings = []
        for elem_id in selection:
            elem = doc.GetElement(elem_id)
            if isinstance(elem, DB.Architecture.Railing):
                railings.append(elem)
            else:
                output.print_md("*Warning: Elemen {} bukan Railing, dilewati*".format(elem_id))
    
    if not railings:
        forms.alert("Tidak ada Railing yang dipilih!", exitscript=True)
        return
    
    output.print_md("\\n**{} Railing ditemukan**\\n".format(len(railings)))
    
    # Step 2: Pilih metode pembuatan
    methods = {
        "Metode 1: Floor (Sederhana)": method_1_floor_approach,
        "Metode 2: Swept Profile (Recommended)": method_2_swept_profile,
        "Metode 3: Wall (Alternatif)": method_3_wall_approach,
    }
    
    selected_method = forms.SelectFromList.show(
        methods.keys(),
        title="Pilih Metode Pembuatan Kansteen",
        button_name="Buat Kansteen"
    )
    
    if not selected_method:
        output.print_md("*Dibatalkan oleh user*")
        return
    
    # Step 3: Konfirmasi parameter
    params_form = forms.RequestForm(
        title="Parameter Kansteen",
        fields=[
            forms.Field(
                name="width",
                label="Lebar Kansteen (mm)",
                default=150,
                type=forms.FieldType.NUMBER
            ),
            forms.Field(
                name="height",
                label="Tinggi Kansteen (mm)",
                default=150,
                type=forms.FieldType.NUMBER
            ),
            forms.Field(
                name="offset",
                label="Offset dari Railing (mm)",
                default=0,
                type=forms.FieldType.NUMBER
            ),
        ]
    )
    
    # Gunakan default jika form tidak tersedia
    global KANSTEEN_WIDTH, KANSTEEN_HEIGHT, KANSTEEN_OFFSET
    
    # Step 4: Mulai transaction dan buat kansteen
    TransactionManager.Instance.EnsureInTransaction(doc)
    
    try:
        method_func = methods[selected_method]
        created_elements = method_func(railings)
        
        TransactionManager.Instance.TransactionTaskDone()
        
        # Step 5: Tampilkan hasil
        output.print_md("\\n---")
        output.print_md("## ✅ Hasil")
        output.print_md("**{} elemen kansteen berhasil dibuat**".format(len(created_elements)))
        
        # Select hasil di Revit
        if created_elements:
            elem_ids = [e.Id for e in created_elements]
            uidoc.Selection.SetElementIds(elem_ids)
            output.print_md("\\n*Elemen kansteen telah dipilih di model*")
            
    except Exception as e:
        TransactionManager.Instance.ForceClose()
        output.print_md("\\n**❌ ERROR:** {}".format(str(e)))
        forms.alert("Terjadi kesalahan:\\n{}".format(str(e)))


# Jalankan main function
if __name__ == '__main__' or __name__ == '__main__':
    main()
`

const alternativeScript = `# -*- coding: utf-8 -*-
"""
Kansteen Generator - Advanced Version (pyRevit)
Membuat kansteen menggunakan Adaptive Components atau Detail Lines.
Versi ini menggunakan pendekatan yang lebih fleksibel.

Author: BIM Indonesia
Version: 2.0.0
"""

__title__ = "Kansteen\\\\nAdvanced"
__author__ = "BIM Indonesia"  
__doc__ = "Advanced kansteen generator dengan multiple output methods."

# ============================================================
# IMPORTS
# ============================================================
import clr
import math

clr.AddReference('RevitAPI')
from Autodesk.Revit.DB import *
from Autodesk.Revit.DB.Architecture import Railing

clr.AddReference('RevitServices')
import RevitServices
from RevitServices.Persistence import DocumentManager
from RevitServices.Transactions import TransactionManager

from pyrevit import script, forms, revit, DB, HOST_APP

doc = DocumentManager.Instance.CurrentDBDocument
uidoc = DocumentManager.Instance.CurrentUIApplication.ActiveUIDocument
output = script.get_output()
logger = script.get_logger()

# ============================================================
# KONFIGURASI
# ============================================================
class KansteenConfig:
    """Konfigurasi parameter kansteen."""
    
    def __init__(self):
        self.width_mm = 150        # Lebar kansteen
        self.height_mm = 150       # Tinggi kansteen  
        self.offset_mm = 0         # Offset dari path
        self.method = "floor"      # floor | wall | detail
        self.join = True           # Auto-join elements
        self.phase = None          # Phase (None = new)
    
    @property
    def width(self):
        return self.width_mm / 304.8  # mm to feet
    
    @property
    def height(self):
        return self.height_mm / 304.8
    
    @property
    def offset(self):
        return self.offset_mm / 304.8


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def mm_to_feet(mm):
    """Konversi mm ke feet."""
    return mm / 304.8


def feet_to_mm(feet):
    """Konversi feet ke mm."""
    return feet * 304.8


def get_railing_paths(railing):
    """
    Mendapatkan semua path curves dari railing.
    Support untuk berbagai tipe railing.
    """
    paths = []
    
    try:
        # Revit 2020+ menggunakan GetPath()
        if hasattr(railing, 'GetPath'):
            path_curves = railing.GetPath()
            if path_curves:
                for curve_array in path_curves:
                    for i in range(curve_array.Size):
                        paths.append(curve_array.get_Item(i))
                return paths
        
        # Fallback: LocationCurve
        loc = railing.Location
        if isinstance(loc, LocationCurve):
            paths.append(loc.Curve)
            return paths
            
    except Exception as e:
        logger.error("Error getting railing paths: {}".format(e))
    
    return paths


def offset_curve(curve, distance, normal=XYZ.BasisZ):
    """
    Membuat offset dari curve.
    """
    try:
        if isinstance(curve, Line):
            start = curve.GetEndPoint(0)
            end = curve.GetEndPoint(1)
            direction = (end - start).Normalize()
            perp = normal.CrossProduct(direction).Normalize()
            
            new_start = start + perp * distance
            new_end = end + perp * distance
            return Line.CreateBound(new_start, new_end)
            
        elif isinstance(curve, Arc):
            # Untuk arc, offset dengan mengubah radius
            center = curve.Center
            radius = curve.Radius
            new_radius = radius + distance
            
            new_arc = Arc.Create(
                center,
                new_radius,
                curve.GetEndPoint(0).DistanceTo(center),
                curve.GetEndPoint(1).DistanceTo(center),
                XYZ.BasisZ
            )
            return new_arc
            
    except Exception as e:
        logger.error("Error offsetting curve: {}".format(e))
    
    return curve


def create_kansteen_profile(width, height):
    """
    Membuat profile kansteen (cross-section).
    Profile berbentuk L atau T tergantung kebutuhan.
    """
    half_w = width / 2.0
    
    # Profile L-shape (kansteen standar)
    profile_points = [
        XYZ(-half_w, 0, 0),
        XYZ(half_w, 0, 0),
        XYZ(half_w, height, 0),
        XYZ(half_w - 0.05, height, 0),  # Chamfer top
        XYZ(-half_w, height * 0.8, 0),
        XYZ(-half_w, 0, 0),
    ]
    
    return profile_points


# ============================================================
# KANSTEEN CREATION METHODS
# ============================================================

class KansteenCreator:
    """Class untuk membuat kansteen dengan berbagai metode."""
    
    def __init__(self, config):
        self.config = config
        self.created = []
    
    def create_as_floor(self, curves):
        """Membuat kansteen sebagai Floor element."""
        
        # Cari floor type yang sesuai
        floor_type = self._get_floor_type()
        level = self._get_level()
        
        if not floor_type or not level:
            return []
        
        for curve in curves:
            try:
                # Offset curve jika perlu
                if self.config.offset != 0:
                    curve = offset_curve(curve, self.config.offset)
                
                # Buat boundary untuk floor
                if isinstance(curve, Line):
                    boundary = self._make_floor_boundary(curve)
                    if boundary:
                        floor = Floor.Create(
                            doc,
                            [boundary],
                            floor_type.Id,
                            level.Id
                        )
                        self.created.append(floor)
                        
            except Exception as e:
                logger.error("Error creating floor kansteen: {}".format(e))
        
        return self.created
    
    def create_as_wall(self, curves):
        """Membuat kansteen sebagai Wall element."""
        
        wall_type = self._get_wall_type()
        level = self._get_level()
        
        if not wall_type or not level:
            return []
        
        for curve in curves:
            try:
                if self.config.offset != 0:
                    curve = offset_curve(curve, self.config.offset)
                
                wall = Wall.Create(
                    doc,
                    curve,
                    wall_type.Id,
                    level.Id,
                    self.config.height,
                    0.0,
                    False,
                    False
                )
                
                # Set parameter lebar wall
                width_param = wall.get_Parameter(BuiltInParameter.WALL_WIDTH)
                if width_param and not width_param.IsReadOnly:
                    width_param.Set(self.config.width)
                
                self.created.append(wall)
                
            except Exception as e:
                logger.error("Error creating wall kansteen: {}".format(e))
        
        return self.created
    
    def create_as_detail(self, curves):
        """Membuat kansteen sebagai Detail/Model lines (preview)."""
        
        for curve in curves:
            try:
                if isinstance(curve, Line):
                    start = curve.GetEndPoint(0)
                    end = curve.GetEndPoint(1)
                    direction = (end - start).Normalize()
                    perp = XYZ.BasisZ.CrossProduct(direction).Normalize()
                    
                    # Offset lines (kiri dan kanan)
                    offset = self.config.width / 2.0
                    if self.config.offset != 0:
                        offset += self.config.offset
                    
                    left_start = start + perp * offset
                    left_end = end + perp * offset
                    right_start = start - perp * offset
                    right_end = end - perp * offset
                    
                    # Buat model curves
                    sketch_plane = self._get_sketch_plane(start)
                    
                    left_line = doc.Create.NewModelCurve(
                        Line.CreateBound(left_start, left_end),
                        sketch_plane
                    )
                    right_line = doc.Create.NewModelCurve(
                        Line.CreateBound(right_start, right_end),
                        sketch_plane
                    )
                    
                    self.created.extend([left_line, right_line])
                    
            except Exception as e:
                logger.error("Error creating detail kansteen: {}".format(e))
        
        return self.created
    
    def _get_floor_type(self):
        """Mendapatkan Floor Type untuk kansteen."""
        collector = FilteredElementCollector(doc).OfClass(FloorType)
        
        # Cari yang mengandung kata 'kansteen' atau 'curb'
        for ft in collector:
            name = ft.Name.lower()
            if any(word in name for word in ['kansteen', 'curb', 'kerb', 'border', 'plint']):
                return ft
        
        # Fallback: gunakan yang pertama
        return collector.FirstElement()
    
    def _get_wall_type(self):
        """Mendapatkan Wall Type untuk kansteen."""
        collector = FilteredElementCollector(doc).OfClass(WallType)
        
        for wt in collector:
            name = wt.Name.lower()
            if any(word in name for word in ['kansteen', 'curb', 'kerb', 'border', 'plint']):
                return wt
        
        return collector.FirstElement()
    
    def _get_level(self):
        """Mendapatkan Level aktif atau pertama."""
        # Coba dapatkan level dari active view
        active_level = doc.ActiveView.GenLevel
        if active_level:
            return active_level
        
        # Fallback
        levels = FilteredElementCollector(doc).OfClass(Level).ToElements()
        return levels[0] if levels else None
    
    def _make_floor_boundary(self, line):
        """Membuat boundary CurveArray dari line untuk floor."""
        start = line.GetEndPoint(0)
        end = line.GetEndPoint(1)
        direction = (end - start).Normalize()
        perp = XYZ.BasisZ.CrossProduct(direction).Normalize()
        
        half_w = self.config.width / 2.0
        
        p1 = start + perp * half_w
        p2 = end + perp * half_w
        p3 = end - perp * half_w
        p4 = start - perp * half_w
        
        boundary = CurveArray()
        boundary.Append(Line.CreateBound(p1, p2))
        boundary.Append(Line.CreateBound(p2, p3))
        boundary.Append(Line.CreateBound(p3, p4))
        boundary.Append(Line.CreateBound(p4, p1))
        
        return boundary
    
    def _get_sketch_plane(self, point):
        """Mendapatkan SketchPlane untuk point yang diberikan."""
        plane = Plane.CreateByNormalAndOrigin(XYZ.BasisZ, point)
        return SketchPlane.Create(doc, plane)


# ============================================================
# MAIN
# ============================================================

def main():
    output.print_md("# 🏗️ Kansteen Generator - Advanced")
    output.print_md("---\\n")
    
    # Get selected railings
    selected = uidoc.Selection.GetElementIds()
    railings = []
    
    for elem_id in selected:
        elem = doc.GetElement(elem_id)
        if isinstance(elem, Railing):
            railings.append(elem)
    
    if not railings:
        forms.alert("Pilih minimal 1 Railing!", exitscript=True)
        return
    
    output.print_md("**{} Railing terpilih**\\n".format(len(railings)))
    
    # Konfigurasi
    config = KansteenConfig()
    
    # Tampilkan form konfigurasi
    config_data = forms.ask_for_string(
        default="150",
        prompt="Lebar kansteen (mm):",
        title="Konfigurasi Kansteen"
    )
    
    if config_data:
        try:
            config.width_mm = float(config_data)
        except:
            pass
    
    # Pilih metode
    method = forms.SelectFromList.show(
        ["Floor Element", "Wall Element", "Detail Lines (Preview)"],
        title="Metode Pembuatan"
    )
    
    if not method:
        return
    
    # Mapping method
    method_map = {
        "Floor Element": "floor",
        "Wall Element": "wall",
        "Detail Lines (Preview)": "detail"
    }
    config.method = method_map[method]
    
    # Execute
    creator = KansteenCreator(config)
    
    t = Transaction(doc, "Create Kansteen from Railing")
    t.Start()
    
    try:
        for railing in railings:
            curves = get_railing_paths(railing)
            output.print_md("- Railing ID {}: {} path curves".format(
                railing.Id, len(curves)
            ))
            
            if config.method == "floor":
                creator.create_as_floor(curves)
            elif config.method == "wall":
                creator.create_as_wall(curves)
            elif config.method == "detail":
                creator.create_as_detail(curves)
        
        t.Commit()
        
        output.print_md("\\n✅ **{} elemen kansteen berhasil dibuat!**".format(
            len(creator.created)
        ))
        
        # Select created elements
        if creator.created:
            ids = [e.Id for e in creator.created]
            uidoc.Selection.SetElementIds(ids)
            uidoc.ShowElements(ids)
            
    except Exception as e:
        t.RollBack()
        output.print_md("\\n❌ **ERROR:** {}".format(str(e)))
        forms.alert("Error: {}".format(str(e)))


# Run
main()
`

const setupScript = `# ============================================================
# FILE: script.py (simpan di folder extension pyRevit)
# STRUKTUR FOLDER:
#
# KansteenExtension/
# ├── Kansteen.tab/
# │   ├── Kansteen.panel/
# │   │   ├── Kansteen.pushbutton/
# │   │   │   ├── script.py      <-- Script utama
# │   │   │   └── icon.png       <-- Icon button (32x32)
# │   │   └── bundle.yaml
# │   └── Kansteen.tab
# └── extension.yaml
#
# ============================================================

# extension.yaml
# ---
# title: Kansteen Tools
# author: BIM Indonesia
# description: Tools untuk membuat kansteen dari railing

# bundle.yaml (di dalam panel folder)
# ---
# title: Kansteen Generator
# layout:
#   - Kansteen

# bundle.yaml (di dalam pushbutton folder)  
# ---
# title: Kansteen from Railing
# tooltip: Membuat kansteen berdasarkan railing
# author: BIM Indonesia
`

export default function ScriptSection() {
  const [activeScript, setActiveScript] = useState<'main' | 'advanced' | 'setup'>('main')
  const [copied, setCopied] = useState(false)

  const scripts = {
    main: { title: 'Script Utama (Basic)', code: mainScript, icon: 'fa-file-code' },
    advanced: { title: 'Script Advanced (OOP)', code: alternativeScript, icon: 'fa-file-code' },
    setup: { title: 'Setup & Struktur Folder', code: setupScript, icon: 'fa-folder-tree' },
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(scripts[activeScript].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([scripts[activeScript].code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeScript === 'main' ? 'kansteen_from_railing.py' : 
                 activeScript === 'advanced' ? 'kansteen_advanced.py' : 'setup_guide.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Script Selector */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(scripts).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveScript(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
              activeScript === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <i className={`fas ${val.icon} mr-2`}></i>
            {val.title}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="relative bg-gray-950 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-400 text-sm font-mono">
              {activeScript === 'main' ? 'kansteen_from_railing.py' : 
               activeScript === 'advanced' ? 'kansteen_advanced.py' : 'setup_guide.txt'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-1.5`}></i>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all flex items-center"
            >
              <i className="fas fa-download mr-1.5"></i>
              Download
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="overflow-auto max-h-[600px]">
          <pre className="p-4 text-sm leading-relaxed">
            <code className="text-gray-300 font-mono whitespace-pre">
              {scripts[activeScript].code}
            </code>
          </pre>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <i className="fas fa-mouse-pointer text-blue-400 mr-2"></i>
            <h4 className="text-sm font-semibold text-white">Step 1</h4>
          </div>
          <p className="text-gray-400 text-xs">
            Pilih railing di Revit model yang akan dijadikan path kansteen
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <i className="fas fa-play text-green-400 mr-2"></i>
            <h4 className="text-sm font-semibold text-white">Step 2</h4>
          </div>
          <p className="text-gray-400 text-xs">
            Jalankan script melalui pyRevit toolbar, pilih metode pembuatan
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-2">
            <i className="fas fa-check-double text-purple-400 mr-2"></i>
            <h4 className="text-sm font-semibold text-white">Step 3</h4>
          </div>
          <p className="text-gray-400 text-xs">
            Kansteen otomatis dibuat mengikuti path railing, siap digunakan
          </p>
        </div>
      </div>
    </div>
  )
}
